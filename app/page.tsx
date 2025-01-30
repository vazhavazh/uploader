import { Uploader } from "@/components/Uploader";

export default function Home() {
	return (
		<>
			<Uploader label={"РИСУНОК"} />
			<Uploader label={"МАЛЮНОК"} />
			<Uploader label={"PICTURE"} />
		</>
	);
}
