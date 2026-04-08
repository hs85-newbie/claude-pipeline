"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/issue-helpers";

interface User {
  name: string | null;
  email: string;
  image: string | null;
  githubLogin: string | null;
  createdAt: string;
}

export function ProfileCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">프로필</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>
              {user.name?.charAt(0) ?? user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">{user.name ?? "이름 없음"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.githubLogin && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  @{user.githubLogin}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  가입 {formatRelativeTime(user.createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
