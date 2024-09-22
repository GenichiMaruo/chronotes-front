"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MinimizeIcon, MaximizeIcon } from "lucide-react"
import { useApiUrl } from "@/components/api-provider"
import { getCookie } from "@/lib/cookie"

// Fetch summaries inside the component
export default function SummaryBlock() {
  const [summaries, setSummaries] = useState<Record<string, string>>({
    today: "",
    week: "",
    month: "",
    quarter: "",
    year: "",
  })
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    today: true,
    week: false,
    month: false,
    quarter: false,
    year: false,
  })
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState("today")
  const apiUrl = useApiUrl(); // Move useApiUrl inside the component

  // Helper function to format the date range for each period
  const getDateRange = (period: string) => {
    const now = new Date();
    let fromDate: Date;
    const toDate: Date = new Date(now);

    switch (period) {
      case "today":
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        fromDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        fromDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "quarter":
        fromDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "year":
        fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        throw new Error("Invalid period");
    }

    return {
      from: encodeURIComponent(fromDate.toISOString()),
      to: encodeURIComponent(toDate.toISOString())
    };
  };

  // Fetch summary for each period using the new API
  const fetchSummary = useCallback(async (period: string) => {
    const { from, to } = getDateRange(period);
    const endpoint = `${apiUrl}/notes/summary?from=${from}&to=${to}`;

    const token = getCookie("token");
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching summary:", error);
      return "Failed to fetch summary";
    }
  }, [apiUrl]); // Add apiUrl as a dependency to useCallback

  // Fetch summaries when the active tab changes
  useEffect(() => {
    const loadSummary = async (period: string) => {
      setLoadingStates(prev => ({ ...prev, [period]: true }));
      const summary = await fetchSummary(period);
      setSummaries(prev => ({ ...prev, [period]: summary }));
      setLoadingStates(prev => ({ ...prev, [period]: false }));
    };

    if (!summaries[activeTab]) {
      loadSummary(activeTab);
    }
  }, [activeTab, fetchSummary, summaries]); // Add fetchSummary as a dependency

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
            {["today", "week", "month", "quarter", "year"].map((period) => (
              <TabsContent key={period} value={period} className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    {loadingStates[period] ? (
                      <p className="text-sm">Loading {period} summary...</p>
                    ) : (
                      <p className="text-sm">{summaries[period]}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
