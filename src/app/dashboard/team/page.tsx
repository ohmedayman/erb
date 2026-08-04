"use client";

import { UserPlus, Shield, Edit, Trash2 } from "lucide-react";

const teamMembers = [
  { name: "John Doe", email: "john@company.com", role: "Admin", status: "Active", joined: "Jan 2026" },
  { name: "Sarah Wilson", email: "sarah@company.com", role: "Manager", status: "Active", joined: "Mar 2026" },
  { name: "Mike Johnson", email: "mike@company.com", role: "Staff", status: "Active", joined: "Jun 2026" },
  { name: "Emily Davis", email: "emily@company.com", role: "Staff", status: "Invited", joined: "Aug 2026" },
];

const roleColors: Record<string, string> = {
  Admin: "bg-purple-50 text-purple-600",
  Manager: "bg-blue-50 text-blue-600",
  Staff: "bg-gray-50 text-gray-600",
};

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage team members and their roles
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Member</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role] || ""}`}>
                      <Shield className="w-3 h-3" />
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === "Active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{member.joined}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
