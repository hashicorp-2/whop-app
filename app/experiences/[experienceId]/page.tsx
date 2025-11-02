import TrendToProductApp from "./TrendToProductApp";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	return <TrendToProductApp />;
}
