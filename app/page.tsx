import { MultiUploader } from "@/components/MultiUploader";

export default function Home() {
	const labels = ["label1", "label2", "label3"];

	return (
		<>
			
			<MultiUploader labels={labels} />
		</>
	);
}
