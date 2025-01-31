import { MultiUploader } from "@/components/MultiUploader";
import { requiredVideosArray } from "@/file-name-index/name-index";
// import { lifeboatDetailsArray, requiredVideosArray } from "@/file-name-index/name-index";


export default function Home() {
	// const labels = ["label1", "label2", "label3"];

	return (
		<>
			{/* <MultiUploader labels={labels} /> */}
			{/* <MultiUploader details={lifeboatDetailsArray} /> */}
			<MultiUploader details={requiredVideosArray} />
		</>
	);
}
