"use client";
import { useState, useEffect } from "react";
export default function UpdatePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasPassword, setHasPassword] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) return setHasPassword(true); // default to true
        const data = await res.json();
        setHasPassword(data.hasPassword);
      } catch {
        setHasPassword(true);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {hasPassword && (
        <div>
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter current password"
          />
        </div>
      )}

      {!hasPassword && (
        <div className="text-sm text-gray-500">
          You currently have no password. Set one to enable credential login.
        </div>
      )}

      <div>
        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter new password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </form>
  );
}

// "use client";

// import { useState } from "react";

// export default function UpdatePasswordForm() {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch("/api/user/update-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ currentPassword, newPassword }),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error || "Failed to update password");

//       setMessage("Password updated successfully!");
//       setCurrentPassword("");
//       setNewPassword("");
//     } catch (err: any) {
//       setMessage(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
//       <div>
//         <label>Current Password (if set)</label>
//         <input
//           type="password"
//           value={currentPassword}
//           onChange={(e) => setCurrentPassword(e.target.value)}
//           className="w-full p-2 border rounded"
//         />
//       </div>

//       <div>
//         <label>New Password</label>
//         <input
//           type="password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           className="w-full p-2 border rounded"
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="px-4 py-2 bg-blue-500 text-white rounded"
//       >
//         {loading ? "Updating..." : "Update Password"}
//       </button>

//       {message && <p className="mt-2 text-red-500">{message}</p>}
//     </form>
//   );
// }
