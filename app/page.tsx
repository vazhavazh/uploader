import { MultiUploader } from "@/components/Uploader";

export default function Home() {
	const labels = ["label1", "label2", "label3"];

	return (
		<>
			{/* <Uploader label={"РИСУНОК"} />
			<Uploader
				label={"МАЛЮНОК"}
				tooltip='МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК '
			/>
			<Uploader label={"PICTURE"} /> */}
			<MultiUploader labels={labels} />
		</>
	);
}
