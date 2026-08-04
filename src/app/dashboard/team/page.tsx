"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, Edit, Trash2 } from "lucide-react";
import { auth } from "@/lib/firebase";

const roleColors: Record<string, string> = {
  Admin: "bg-purple-50 text-purple-600",
  Manager: "bg-blue-50 text-blue-600",
  Staff: "bg-gray-50 text-gray-600",
};

const roleLabels: Record<string, string> = {
  Admin: "مدير",
  Manager: "مدير قسم",
  Staff: "موظف",
};

const statusLabels: Record<string, string> = {
  Active: "نشط",
};

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Staff" });

  const fetchMembers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch("/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newMember),
    });
    if (res.ok) {
      setShowModal(false);
      setNewMember({ name: "", email: "", role: "Staff" });
      fetchMembers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الفريق</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة أعضاء الفريق وأدوارهم</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          <UserPlus className="w-4 h-4" /> دعوة عضو
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">العضو</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الدور</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">جاري التحميل...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">لا يوجد أعضاء في الفريق</td></tr>
              ) : (
                members.map((member, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">{member.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role] || ""}`}>
                        <Shield className="w-3 h-3" /> {roleLabels[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === "Active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{statusLabels[member.status] || member.status}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(member.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">دعوة عضو</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">الاسم</label>
                <input type="text" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">الدور</label>
                <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="Staff">موظف</option><option value="Manager">مدير قسم</option><option value="Admin">مدير</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">إلغاء</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">إرسال الدعوة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
