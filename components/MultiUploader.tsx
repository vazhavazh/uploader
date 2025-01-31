"use client";

// import { cn } from "@/lib/utils";
import { DetailObj } from "@/types/detail-obj";
import axios from "axios";
import Image from "next/image";
import { ChangeEvent,  useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

interface UploaderProps {
	details: DetailObj[];
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export const MultiUploader = ({ details }: UploaderProps) => {
	const [files, setFiles] = useState<{ [key: string]: File }>({});
	const [previews, setPreviews] = useState<{ [key: string]: string }>({});
	const [status, setStatus] = useState<UploadStatus>("idle");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [extraInputs, setExtraInputs] = useState<{ [label: string]: number }>(
		{}
	);

	// function handleChange(name: string) {
	// 	return (e: ChangeEvent<HTMLInputElement>) => {
	// 		if (e.target.files && e.target.files[0]) {
	// 			const selectedFile = e.target.files[0];

	// 			// Очистка старого preview (важно для предотвращения утечек памяти)
	// 			if (previews[name]) {
	// 				URL.revokeObjectURL(previews[name]);
	// 			}

	// 			setFiles((prev) => ({
	// 				...prev,
	// 				[name]: selectedFile,
	// 			}));

	// 			setPreviews((prev) => ({
	// 				...prev,
	// 				[name]:
	// 					selectedFile.type === "application/pdf"
	// 						? "/assets/img/pdf.png" // путь в public
	// 						: URL.createObjectURL(selectedFile),
	// 			}));
	// 		}
	// 	};
	// }
	function handleChange(name: string, index?: number) {
		return (e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files[0]) {
				const selectedFile = e.target.files[0];
				const key = index !== undefined ? `${name}_${index}` : name; // Генерируем уникальный ключ

				// Очистка старого preview (важно для предотвращения утечек памяти)
				if (previews[key]) {
					URL.revokeObjectURL(previews[key]);
				}

				setFiles((prev) => ({
					...prev,
					[key]: selectedFile,
				}));

				setPreviews((prev) => ({
					...prev,
					[key]:
						selectedFile.type === "application/pdf"
							? "/assets/img/pdf.png"
							: URL.createObjectURL(selectedFile),
				}));
			}
		};
	}

	async function handleFileUpload() {
		setStatus("uploading");
		setUploadProgress(0);

		const formData = new FormData();
		Object.entries(files).forEach(([key, file]) => formData.append(key, file));

		try {
			await axios.post("https://httpbin.org/post", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					const progress = progressEvent.total
						? Math.round((progressEvent.loaded * 100) / progressEvent.total)
						: 0;
					setUploadProgress(progress);
				},
			});

			setStatus("success");
			setUploadProgress(100);
		} catch (error) {
			setStatus("error");
			setUploadProgress(0);
			console.error(error);
		}
	}

	// Функция для добавления дополнительных инпутов
	function addExtraInput(label: string) {
		setExtraInputs((prev) => ({
			...prev,
			[label]: (prev[label] || 0) + 1, // Увеличиваем количество инпутов для конкретного label
		}));
	}



	return (
		<div className='space-y-2'>
			{details.map((detailObj) => {
				return (
					<div
						key={detailObj.label}
						className='space-y-2'>
						{/* <h2>{`${detailObj.id} ${detailObj.label}`}</h2> */}
						{detailObj.tooltip ? (
							<>
								<Accordion
									type='single'
									collapsible>
									<AccordionItem value='item-1'>
										<AccordionTrigger>{`${detailObj.id} ${detailObj.label}`}</AccordionTrigger>
										<AccordionContent>{detailObj.tooltip}</AccordionContent>
									</AccordionItem>
								</Accordion>
							</>
						) : (
							<h2>{`${detailObj.id} ${detailObj.label}`}</h2>
						)}
						{/* Основной инпут */}
						{!detailObj.title && (
							<label>
								<input
									type='file'
									name={detailObj.label}
									onChange={handleChange(detailObj.label)}
								/>
							</label>
						)}

						{/* Дополнительные инпуты */}
						{Array.from({ length: extraInputs[detailObj.label] || 0 }).map(
							(_, index) => (
								<div
									key={`${detailObj.label}_extra_${index}`}
									className='block'>
									<label>
										<input
											type='file'
											name={`${detailObj.label}_extra_${index}`}
											onChange={handleChange(detailObj.label, index)}
										/>
									</label>
									{/* Превью для дополнительного инпута */}
									{previews[`${detailObj.label}_${index}`] && (
										<div className='mb-4'>
											<p className='text-sm'>Preview:</p>
											<div className='relative h-[200px] w-auto'>
												<Image
													src={previews[`${detailObj.label}_${index}`]}
													alt={`Selected file ${detailObj.label}_${index}`}
													fill
													className='rounded border border-gray-300 object-contain'
												/>
											</div>
										</div>
									)}
								</div>
							)
						)}
						{/* Превью для основного инпута */}
						{previews[detailObj.label] && (
							<div className='mb-4'>
								<p className='text-sm'>Preview:</p>
								<div className='relative h-[200px] w-auto'>
									<Image
										src={previews[detailObj.label]}
										alt={`Selected file ${detailObj.label}`}
										fill
										className='rounded border border-gray-300 object-contain'
									/>
								</div>
							</div>
						)}

						{/* Кнопка для добавления нового инпута */}
						<button
							onClick={() => addExtraInput(detailObj.label)}
							className='mt-2 px-2 py-1 bg-blue-500 text-white rounded'>
							Добавить инпут
						</button>
					</div>
				);
			})}

			{status === "uploading" && (
				<div className='space-y-2'>
					<div className='h-2.5 w-full rounded-full bg-gray-200'>
						<div
							className='h-2.5 rounded-full bg-blue-600 transition-all duration-300'
							style={{ width: `${uploadProgress}%` }}></div>
					</div>
					<p className='text-sm text-gray-600'>
						{uploadProgress}% upload progress
					</p>
				</div>
			)}

			{Object.values(files).length > 0 && status !== "uploading" && (
				<button
					onClick={handleFileUpload}
					className='bg-yellow-600 px-2 rounded'>
					Upload All
				</button>
			)}

			{status === "success" && (
				<p className='text-sm text-green-600'>
					All files uploaded successfully!
				</p>
			)}

			{status === "error" && (
				<p className='text-sm text-red-600'>Upload failed. Please try again.</p>
			)}
		</div>
	);
};
