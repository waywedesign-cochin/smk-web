import DetailsofStudent from "@/components/student/DetailsofStudent";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <DetailsofStudent StudentId={id} />
    </div>
  );
}
