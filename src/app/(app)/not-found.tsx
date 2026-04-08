import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                대시보드로 이동
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
