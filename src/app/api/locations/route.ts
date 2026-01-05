import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, address, type } = body

    const existing = await prisma.location.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Location code already exists' },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: { name, code, address, type },
    })

    return NextResponse.json({ success: true, data: location }, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    )
  }
}

