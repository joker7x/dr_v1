import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'app/data/drugs.json')

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8')
    const data = JSON.parse(fileContents)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading drugs data:', error)
    return NextResponse.json({ error: 'Failed to read drugs data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, drug, drugId } = body

    // Read current data
    const fileContents = await fs.readFile(dataFilePath, 'utf8')
    const data = JSON.parse(fileContents)

    switch (action) {
      case 'add':
        // Add new drug
        const newId = Math.max(...data.drugs.map((d: any) => parseInt(d.id)), 0) + 1
        const newDrug = {
          ...drug,
          id: newId.toString(),
          updateDate: new Date().toLocaleDateString('ar-EG')
        }
        data.drugs.push(newDrug)
        break

      case 'update':
        // Update existing drug
        const drugIndex = data.drugs.findIndex((d: any) => d.id === drugId)
        if (drugIndex !== -1) {
          data.drugs[drugIndex] = {
            ...drug,
            id: drugId,
            updateDate: new Date().toLocaleDateString('ar-EG')
          }
        }
        break

      case 'delete':
        // Delete drug
        data.drugs = data.drugs.filter((d: any) => d.id !== drugId)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update global updateDate
    data.updateDate = new Date().toLocaleDateString('ar-EG')

    // Write back to file
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating drugs data:', error)
    return NextResponse.json({ error: 'Failed to update drugs data' }, { status: 500 })
  }
}