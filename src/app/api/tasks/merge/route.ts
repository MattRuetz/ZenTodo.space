import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function generateText(input: string): Promise<string> {
    try {
        const response = await hf.request({
            model: 'facebook/bart-large-cnn',
            inputs: input,
            parameters: {
                max_new_tokens: 450,
                do_sample: true,
                top_k: 50,
                top_p: 0.95,
                temperature: 0.7,
            },
        });
        console.log(
            'Raw Hugging Face response:',
            JSON.stringify(response, null, 2)
        );

        if (
            Array.isArray(response) &&
            response.length > 0 &&
            'generated_text' in response[0]
        ) {
            return response[0].summary_text;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error calling the model:', error);
        throw error;
    }
}

async function mergeTasks(targetTask: any, sourceTask: any) {
    try {
        const input = `Merge the following two tasks into a single concise task description:

Task 1: ${targetTask.taskName}
${targetTask.taskDescription}

Task 2: ${sourceTask.taskName}
${sourceTask.taskDescription}

Do not include any preamble or additional text. Do not include anything about the input or output.`;

        let mergedDescription = await generateText(input);

        console.log('Hugging Face response:', mergedDescription);

        // Clean up the output
        mergedDescription = mergedDescription.trim();
        if (mergedDescription.startsWith('Merged task:')) {
            mergedDescription = mergedDescription
                .substring('Merged task:'.length)
                .trim();
        }

        return mergedDescription.slice(0, 450);
    } catch (error) {
        console.error('Hugging Face API error:', error);
        return fallbackMerge(targetTask, sourceTask);
    }
}

function fallbackMerge(targetTask: any, sourceTask: any) {
    const combinedDescription = `${targetTask.taskDescription}\n\n${sourceTask.taskDescription}`;
    return combinedDescription.slice(0, 450);
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { targetTaskId, sourceTaskId } = await req.json();

        if (!targetTaskId || !sourceTaskId) {
            return NextResponse.json(
                { error: 'Invalid task IDs' },
                { status: 400 }
            );
        }

        const [targetTask, sourceTask] = await Promise.all([
            Task.findById(targetTaskId),
            Task.findById(sourceTaskId),
        ]);

        if (!targetTask || !sourceTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        const mergedDescription = await mergeTasks(targetTask, sourceTask);

        targetTask.taskDescription = mergedDescription;
        await targetTask.save();
        await Task.findByIdAndDelete(sourceTaskId);

        return NextResponse.json({ mergedTask: targetTask });
    } catch (error) {
        console.error('Error merging tasks:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
