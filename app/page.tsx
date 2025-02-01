import { MultiUploader } from "@/components/MultiUploader";
import { lifeboatDetailsArray, requiredCopiesArray, rescueBoatDetailsArray } from "@/file-name-index/name-index";

export default function Home() {
	// const labels = ["label1", "label2", "label3"];

	return (
		<>
			{/* <MultiUploader labels={labels} /> */}

			<div className='px-4 pb-5 mt-20 md:mt-24 md:px-8'>
				<h1 className='text-center text-xl font-bold mb-6 md:text-2xl'>
					Lifeboat & Rescue Boat Assessment Procedure
				</h1>
				<section className='mb-14'>
					<h2 className='text-center text-base font-semibold mb-2'>
						Required photos (lifeboat):
					</h2>
					<MultiUploader details={lifeboatDetailsArray} />
				</section>
				<section className='mb-14'>
					<h2 className='text-center text-base font-semibold mb-2'>
						Required photos (rescue boat):
					</h2>
					<MultiUploader details={rescueBoatDetailsArray} />
				</section>

				<section className='mb-14'>
					<h2 className='text-center text-base font-semibold mb-2'>
						Required copies:
					</h2>
					<MultiUploader details={requiredCopiesArray} />
				</section>
			</div>
		</>
	);
}
