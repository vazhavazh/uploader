"use client";

// import { cn } from "@/lib/utils";
import { DetailObj } from "@/types/detail-obj";
import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

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
	const [fileNames, setFileNames] = useState<{ [fileName: string]: string }>(
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
	function handleChange(label: string, index?: number) {
		return (e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files[0]) {
				const selectedFile = e.target.files[0];
				const key = index !== undefined ? `${label}_${index}` : label; // Генерируем уникальный ключ

				const fileName = selectedFile.name;

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

				setFileNames((prev) => ({
					...prev,
					[key]: fileName,
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
		<div className='space-y-2 '>
			{details.map((detailObj) => {
				return (
					<div
						key={detailObj.label}
						className='space-y-2 '>
						{detailObj.tooltip ? (
							<>
								<Accordion
									type='single'
									collapsible>
									<AccordionItem value='item-1'>
										<AccordionTrigger>
											<h2 className='text-base'>{`${detailObj.id} ${detailObj.label}`}</h2>
										</AccordionTrigger>
										<AccordionContent>{detailObj.tooltip}</AccordionContent>
									</AccordionItem>
								</Accordion>
							</>
						) : (
							<h2>{`${detailObj.id} ${detailObj.label}`}</h2>
						)}
						{/* Основной инпут */}
						{/* {!detailObj.title && (
							<label>
								<input
									type='file'
									name={detailObj.label}
									onChange={handleChange(detailObj.label)}
								/>
							</label>
						)} */}
						{!detailObj.title && (
							<label className='flex bg-[#488aec] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
								<input
								className="hidden opacity-0"
									type='file'
									name={detailObj.label}
									onChange={handleChange(detailObj.label)}
								/>
								<svg
									className='w-5 h-5'
									aria-hidden='true'
									stroke='currentColor'
									strokeWidth='2'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										strokeWidth='2'
										stroke='#fffffff'
										d='M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125'
										strokeLinejoin='round'
										strokeLinecap='round'></path>
									<path
										strokeLinejoin='round'
										strokeLinecap='round'
										strokeWidth='2'
										stroke='#fffffff'
										d='M17 15V18M17 21V18M17 18H14M17 18H20'></path>
								</svg>
								ADD FILE
							</label>
						)}

						{/* Отображение имени файла для основного инпута */}
						{fileNames[detailObj.label] && (
							<p className='text-sm text-red-600'>
								Selected file: {fileNames[detailObj.label]}
							</p>
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

									{/* Отображение имени файла для дополнительного инпута */}
									{fileNames[`${detailObj.label}_${index}`] && (
										<p className='text-sm text-red-600'>
											Selected file: {fileNames[`${detailObj.label}_${index}`]}
										</p>
									)}

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
						{!detailObj.title && (
							<button
								onClick={() => addExtraInput(detailObj.label)}
								className='mt-2 px-2 py-1 bg-blue-500 text-white rounded'>
								Добавить инпут
							</button>
						)}
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
