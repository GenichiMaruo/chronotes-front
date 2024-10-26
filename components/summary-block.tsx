'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiHandler } from "@/hooks/use-api"
import WordCloud from "@/components/word-cloud"

const timePeriods = [
  { value: "5d", label: "Last 5 days" },
  { value: "1w", label: "Last week" },
  { value: "2w", label: "Last 2 weeks" },
  { value: "1m", label: "Last month" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
]

export default function SummaryView() {
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1w")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })

  const getDateRange = (period: string) => {
    const now = new Date()
    const fromDate: Date = new Date(now)

    switch (period) {
      case "5d":
        fromDate.setDate(now.getDate() - 5)
        break
      case "1w":
        fromDate.setDate(now.getDate() - 7)
        break
      case "2w":
        fromDate.setDate(now.getDate() - 14)
        break
      case "1m":
        fromDate.setMonth(now.getMonth() - 1)
        break
      case "3m":
        fromDate.setMonth(now.getMonth() - 3)
        break
      case "6m":
        fromDate.setMonth(now.getMonth() - 6)
        break
      case "1y":
        fromDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        throw new Error("Invalid period")
    }

    return {
      from: encodeURIComponent(fromDate.toISOString()),
      to: encodeURIComponent(now.toISOString()),
    }
  }

  const fetchSummary = useCallback(async (period: string) => {
    const { apiRequest } = ApiHandler()
    const { from, to } = getDateRange(period)
    setDateRange({ from, to })
    const endpoint = `/notes/summary?from=${from}&to=${to}`

    try {
      setIsLoading(true)
      const data = await apiRequest({
        method: "GET",
        url: endpoint,
      })

      if (data) {
        setSummary(data.result)
      }
    } catch (error) {
      console.error("Error fetching summary:", error)
      setSummary("Failed to fetch summary")
    } finally {
      setIsLoading(false)
    }

  }, [])

  useEffect(() => {
    fetchSummary(selectedPeriod)
  }, [selectedPeriod, fetchSummary])

  return (
    <>
      {/* ワードクラウドの描画 */}
      <div className="flex justify-center items-center p-4">
        <WordCloud from={dateRange.from} to={dateRange.to} />
      </div>
      <Card className="w-full h-auto">

        {/* サマリーの表示 */}
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg font-bold">Summary View</CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm">Loading summary...</p>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{summary}</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
