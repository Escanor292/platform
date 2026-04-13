"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

export default function PaymentSimulatorPage() {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Chỉ cho phép trong development
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      window.location.href = "/";
    }
  }, []);

  const fetchPendingPledges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test/simulate-payment");
      const data = await res.json();
      setPledges(data.pledges || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch pledges");
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async (pledgeId: string, status: string) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/test/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pledgeId, status }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchPendingPledges(); // Refresh list
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to simulate payment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPledges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                💳 Payment Simulator
              </h1>
              <p className="text-gray-500">
                Test payment webhooks on localhost (Development only)
              </p>
            </div>
            <button
              onClick={fetchPendingPledges}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes("✅") 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* Pledges List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Pledges ({pledges.length})
            </h2>
          </div>

          {loading && pledges.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Clock size={48} className="mx-auto mb-4 animate-spin" />
              Loading...
            </div>
          ) : pledges.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CheckCircle size={48} className="mx-auto mb-4" />
              <p>No pending pledges</p>
              <p className="text-sm mt-2">Create a pledge first to test</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pledges.map((pledge) => (
                <div key={pledge.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-6">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">
                          {pledge.campaignTitle}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                          {pledge.paymentProvider}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-semibold">Backer:</span>{" "}
                          {pledge.displayName}
                        </p>
                        <p>
                          <span className="font-semibold">Amount:</span>{" "}
                          {pledge.amount.toLocaleString("vi-VN")} VNĐ
                        </p>
                        <p>
                          <span className="font-semibold">Pledge ID:</span>{" "}
                          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {pledge.id}
                          </code>
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(pledge.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => simulatePayment(pledge.id, "SUCCESS")}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-semibold"
                      >
                        <CheckCircle size={16} />
                        Success
                      </button>
                      <button
                        onClick={() => simulatePayment(pledge.id, "FAILED")}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-semibold"
                      >
                        <XCircle size={16} />
                        Failed
                      </button>
                    </div>
                  </div>

                  {/* cURL Command */}
                  <details className="mt-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Show cURL command
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded overflow-x-auto">
                      {pledge.curlCommand}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📖 How to use:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Create a pledge on any campaign (status will be PENDING)</li>
            <li>Come back to this page and click "Refresh"</li>
            <li>Click "Success" to simulate successful payment</li>
            <li>Check the campaign page - amount should increase!</li>
            <li>Or use cURL command in terminal for automation</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
