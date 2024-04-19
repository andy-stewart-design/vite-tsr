import { createFileRoute } from "@tanstack/react-router";
import content from "../../../assets/content.json";

export const Route = createFileRoute("/$cat/$det/")({
  component: Detail,
  loader: ({ params }) => getContent(params.cat, params.det),
});

function Detail() {
  const detail = Route.useLoaderData();

  return <div>Welcome to {detail.name}</div>;
}

function getContent(categoryId: string, detailId: string) {
  const category = content.filter((c) => c.id === categoryId)[0];
  const detail = category.details.filter((d) => d.id === detailId)[0];
  return detail;
}
