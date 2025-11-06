"use client";

interface Generation {
	id: string;
	trend: string;
	product_name: string;
	product_description?: string;
	created_at: string;
	status: 'success' | 'failed';
}

interface GenerationHistoryProps {
	generations: Generation[];
}

export default function GenerationHistory({ generations }: GenerationHistoryProps) {
	if (generations.length === 0) {
		return (
			<div className="bg-white rounded-2xl shadow-xl p-12 text-center">
				<div className="text-6xl mb-4">📝</div>
				<h3 className="text-2xl font-bold text-gray-900 mb-2">
					No Generations Yet
				</h3>
				<p className="text-gray-700">
					Start generating products to see your history here
				</p>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getStatusBadge = (status: string) => {
		if (status === 'success') {
			return (
				<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
					✓ Success
				</span>
			);
		}
		return (
			<span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
				✗ Failed
			</span>
		);
	};

	return (
		<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
			<div className="px-8 py-6 border-b border-gray-200">
				<h2 className="text-2xl font-bold text-gray-900">
					Recent Generations
				</h2>
			</div>
			
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
								Trend
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
								Product
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
								Date
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
								Status
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{generations.map((gen) => (
							<tr key={gen.id} className="hover:bg-gray-50 transition">
								<td className="px-6 py-4">
									<div className="text-sm font-medium text-gray-900">
										{gen.trend}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm text-gray-900">
										{gen.product_name}
									</div>
									{gen.product_description && (
										<div className="text-xs text-gray-600 mt-1 line-clamp-2">
											{gen.product_description}
										</div>
									)}
								</td>
								<td className="px-6 py-4">
									<div className="text-sm text-gray-600">
										{formatDate(gen.created_at)}
									</div>
								</td>
								<td className="px-6 py-4">
									{getStatusBadge(gen.status)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{generations.length >= 10 && (
				<div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
					<p className="text-sm text-gray-600">
						Showing last 10 generations
					</p>
				</div>
			)}
		</div>
	);
}
