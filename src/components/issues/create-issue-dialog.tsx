"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { ISSUE_TYPE_CONFIG } from "@/lib/issue-helpers";

interface Project {
  id: string;
  name: string;
  defaultBranch: string;
}

interface Props {
  projects: Project[];
}

export function CreateIssueDialog({ projects }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("CODE_FIX");
  const [priority, setPriority] = useState("MEDIUM");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [targetBranch, setTargetBranch] = useState("");

  const selectedProject = projects.find((p) => p.id === projectId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type: issueType,
          priority,
          projectId,
          ...(targetBranch ? { targetBranch } : {}),
        }),
      });

      const json = await res.json();

      if (json.error) {
        toast.error(json.error.message);
        return;
      }

      toast.success("이슈가 생성되었습니다.");
      setOpen(false);
      setTitle("");
      setDescription("");
      setIssueType("CODE_FIX");
      setPriority("MEDIUM");
      setTargetBranch("");
      router.refresh();
    } catch (error) {
      console.error("[Issue] 생성 실패:", error);
      toast.error("이슈를 생성할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          새 이슈
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 이슈 생성</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">프로젝트</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="프로젝트 선택" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="이슈 제목을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>유형</Label>
            <RadioGroup
              value={issueType}
              onValueChange={setIssueType}
              className="flex gap-4"
            >
              {Object.entries(ISSUE_TYPE_CONFIG).map(([key, cfg]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                >
                  <RadioGroupItem value={key} />
                  <div>
                    <p className="font-medium">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">{cfg.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이슈 상세 설명 (선택)"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">우선순위</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">낮음</SelectItem>
                <SelectItem value="MEDIUM">보통</SelectItem>
                <SelectItem value="HIGH">높음</SelectItem>
                <SelectItem value="CRITICAL">긴급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetBranch">타겟 브랜치</Label>
            <Input
              id="targetBranch"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              placeholder={selectedProject?.defaultBranch ?? "main"}
            />
            <p className="text-xs text-muted-foreground">
              비워두면 프로젝트 기본 브랜치({selectedProject?.defaultBranch ?? "main"})를 사용합니다.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              생성
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
