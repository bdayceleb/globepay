import { NextResponse } from 'next/server';
import { db, TransactionDraft } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const draftData = await request.json();

        // Ensure id exists, or create one
        const draftId = draftData.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const draft: TransactionDraft = {
            ...draftData,
            id: draftId,
            userId: session.userId,
            updatedAt: Date.now(),
            createdAt: draftData.createdAt || Date.now()
        };

        if (!draft.status) {
            draft.status = 'draft';
        }

        await db.saveDraft(draft);

        return NextResponse.json({ success: true, draft });
    } catch (error) {
        console.error("Draft Save API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const drafts = await db.getUserDrafts(session.userId);

        return NextResponse.json({ success: true, transactions: drafts });
    } catch (error) {
        console.error("Fetch Drafts API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
