"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MinimizeIcon, MaximizeIcon } from "lucide-react"

// Simulated API call
const fetchSummaries = async () => {
  // In a real scenario, this would be an actual API call
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
  return {
    today: "Today's summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    week: "This week's summary: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    month: "This month's summary: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    quarter: "Quarterly summary: Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    year: "Yearly summary: Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia."
  }
}

export default function SummaryBlock() {
  const [summaries, setSummaries] = useState<Record<string, string> | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState("today")

  useEffect(() => {
    fetchSummaries().then(setSummaries)
  }, [])

  if (!summaries) {
    return <div className="w-full text-center">Loading summaries...</div>
  }

  return (
    <Card className={`w-full transition-all duration-300 h-auto`}>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg font-bold">Summary Dashboard</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? <MaximizeIcon className="h-4 w-4" /> : <MinimizeIcon className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {!isMinimized && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            {Object.entries(summaries).map(([period, summary]) => (
              <TabsContent key={period} value={period} className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm">{summary}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}