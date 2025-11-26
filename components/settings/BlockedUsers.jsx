"use client";
import React from "react";

const BlockedUsers = ({ blockedUsers, setBlockedUsers, onBack }) => {
  // 🧠 function to unblock someone
  const handleUnblock = (id) => {
    const confirmed = window.confirm("Unblock this user?");
    if (!confirmed) return;

    // remove the user from the blocked list
    setBlockedUsers((prev) => prev.filter((userId) => userId !== id));
  };

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Blocked Users</h2>
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-black cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* If there are no blocked users */}
        {blockedUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-black">
            You haven’t blocked anyone yet.
          </div>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((id) => (
              <div
                key={id}
                className="bg-white p-4 rounded-xl shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <span className="text-sm font-semibold">{id}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      User ID {id}
                    </p>
                    <p className="text-sm text-gray-500">Blocked user</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsers;
