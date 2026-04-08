"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/issue-helpers";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsed: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
}

interface Props {
  apiKeys: ApiKeyItem[];
  projects: { id: string; name: string }[];
}

export function ApiKeysCard({ apiKeys, projects }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyProject, setNewKeyProject] = useState("all");
  // WHY: 생성된 raw 키는 한 번만 표시 — 다이얼로그 닫으면 다시 볼 수 없음
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          ...(newKeyProject !== "all" ? { projectId: newKeyProject } : {}),
        }),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error.message);
        return;
      }

      setGeneratedKey(json.data.key);
      toast.success("API 키가 생성되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("[Settings] API 키 생성 실패:", error);
      toast.error("API 키를 생성할 수 없습니다.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);

    try {
      const res = await fetch(`/api/api-keys/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) {
        toast.error(json.error.message);
        return;
      }
      toast.success("API 키가 삭제되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("[Settings] API 키 삭제 실패:", error);
      toast.error("API 키를 삭제할 수 없습니다.");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  }

  function handleCopy() {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setNewKeyName("");
      setNewKeyProject("all");
      setGeneratedKey(null);
      setCopied(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">API 키</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              새 키 생성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {generatedKey ? "API 키 생성 완료" : "새 API 키 생성"}
              </DialogTitle>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/10 p-3">
                  <p className="text-xs font-medium text-[hsl(var(--warning))]">
                    이 키는 한 번만 표시됩니다. 지금 복사해서 안전한 곳에 저장하세요.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono break-all">
                    {generatedKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopy} aria-label={copied ? "복사 완료" : "API 키 복사"}>
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleDialogClose(false)}
                >
                  완료
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">키 이름</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="예: production, CI/CD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>프로젝트 (선택)</Label>
                  <Select value={newKeyProject} onValueChange={setNewKeyProject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 프로젝트</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={creating || !newKeyName.trim()}
                  >
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    생성
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <Key className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              아직 API 키가 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{key.name}</p>
                    {key.project && (
                      <Badge variant="secondary" className="text-xs">
                        {key.project.name}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <code className="font-mono">{key.keyPrefix}</code>
                    <span>생성 {formatRelativeTime(key.createdAt)}</span>
                    {key.lastUsed && (
                      <span>
                        마지막 사용 {formatRelativeTime(key.lastUsed)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${key.name} 키 삭제`}
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget({ id: key.id, name: key.name })}
                  disabled={deleting === key.id}
                >
                  {deleting === key.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="API 키 삭제"
        description={`"${deleteTarget?.name}" 키를 삭제하시겠습니까? 이 키를 사용하는 서비스가 중단됩니다.`}
        confirmLabel="삭제"
        loading={!!deleting}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
