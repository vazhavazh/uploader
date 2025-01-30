import { Uploader } from "@/components/Uploader";

export default function Home() {
	return (
		<>
			<Uploader label={"РИСУНОК"} />
			<Uploader
				label={"МАЛЮНОК"}
				tooltip='МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК МАЛЮНОК '
			/>
			<Uploader label={"PICTURE"} />
		</>
	);
}
