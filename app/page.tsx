import { MultiUploader } from "@/components/MultiUploader";
import { requiredVideosArray } from "@/file-name-index/name-index";
// import { lifeboatDetailsArray, requiredVideosArray } from "@/file-name-index/name-index";


export default function Home() {
	// const labels = ["label1", "label2", "label3"];

	return (
		<>
			{/* <MultiUploader labels={labels} /> */}

			<header className='bg-slate-600 fixed z-999999 top-0 h-16 w-full'></header>
			<div className='bg-slate-200 mt-16 px-4'>
				<MultiUploader details={requiredVideosArray} />
				{/* <MultiUploader details={lifeboatDetailsArray} /> */}
			</div>
		</>
	);
}
