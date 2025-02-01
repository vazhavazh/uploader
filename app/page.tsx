import { MultiUploader } from "@/components/MultiUploader";
import { requiredVideosArray } from "@/file-name-index/name-index";
import { lifeboatDetailsArray} from "@/file-name-index/name-index";
import SeaCloud from "@/assets/svg/logo.svg";

export default function Home() {
	// const labels = ["label1", "label2", "label3"];

	return (
		<>
			{/* <MultiUploader labels={labels} /> */}

			<div className='bg-slate-900 fixed z-50 top-0 h-16 w-full px-5'>
				<div className="flex justify-center">
					<div className='w-16'>
						<SeaCloud />
					</div>
				</div>
			</div>
			<div className='  mt-16 px-4 pb-5'>
				<MultiUploader details={requiredVideosArray} />
				<MultiUploader details={lifeboatDetailsArray} />
			</div>
		</>
	);
}
