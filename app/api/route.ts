import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest){
    const results = {
        message: "Hello world",
    }

    return NextResponse.json(results);
}