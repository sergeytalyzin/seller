import { NextRequest, NextResponse } from "next/server";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await getDataStore(ctx.store.id).deleteBonusAccrual(id);
    if (!deleted) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/bonus-points/[id]", error);
    return NextResponse.json(
      { error: "Не удалось удалить запись" },
      { status: 500 },
    );
  }
}
