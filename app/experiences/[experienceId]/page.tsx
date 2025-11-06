import TrendToProductApp from "./TrendToProductApp";
import ErrorBoundary from "@/components/ErrorBoundary";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	return (
		<ErrorBoundary>
			<TrendToProductApp />
		</ErrorBoundary>
	);
}
