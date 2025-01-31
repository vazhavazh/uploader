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

						{/* Отображение имени файла для основного инпута */}
						{fileNames[detailObj.label] && (
							<p className='text-sm text-red-600'>
								Selected file: {fileNames[detailObj.label]}
							</p>
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

						{/* Основной инпут */}
						{!detailObj.title && (
							<label className='flex bg-[#488aec] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
								<input
									className='hidden opacity-0'
									type='file'
									name={detailObj.label}
									onChange={handleChange(detailObj.label)}
								/>
								<svg
									className='w-5 h-5'
									version='1.0'
									xmlns='http://www.w3.org/2000/svg'
									width='512.000000pt'
									height='512.000000pt'
									viewBox='0 0 512.000000 512.000000'
									preserveAspectRatio='xMidYMid meet'>
									<g
										transform='translate(0.000000,512.000000) scale(0.100000,-0.100000)'
										fill='#ffffff'
										stroke='none'>
										<path
											d='M661 4784 c-141 -38 -260 -148 -315 -292 l-21 -57 -3 -1440 c-2
-1012 0 -1457 8 -1497 26 -136 113 -258 231 -322 104 -58 68 -56 1241 -56
l1078 0 0 160 0 160 -1069 0 -1068 0 -34 23 c-73 49 -69 -15 -69 1020 l0 927
1760 0 1760 0 0 -585 0 -585 160 0 160 0 0 840 c0 572 -4 856 -11 892 -29 140
-127 264 -258 327 l-76 36 -842 5 -842 5 -271 210 c-149 116 -285 218 -303
228 -29 16 -77 17 -597 16 -461 0 -575 -3 -619 -15z m1376 -523 c155 -120 290
-223 300 -227 10 -5 406 -11 880 -14 l861 -5 27 -25 c42 -38 55 -80 55 -175
l0 -85 -1760 0 -1760 0 0 318 c0 354 2 364 69 409 l34 23 506 0 506 0 282
-219z'
										/>
										<path
											d='M3135 2546 c-41 -18 -83 -69 -90 -109 -9 -47 183 -1994 200 -2026 43
-84 139 -114 220 -68 35 20 65 64 247 362 114 187 213 343 220 347 7 4 180 18
385 31 420 27 422 28 462 111 36 74 22 136 -45 196 -87 78 -1454 1151 -1479
1160 -36 14 -84 12 -120 -4z m671 -827 c217 -172 391 -315 387 -319 -4 -4 -95
-12 -201 -19 -114 -6 -207 -17 -226 -25 -42 -17 -52 -31 -166 -219 -52 -86
-96 -154 -98 -152 -3 3 -102 996 -102 1028 0 9 3 17 6 17 3 0 183 -140 400
-311z'
										/>
									</g>
								</svg>
								SELECT FILE
							</label>
						)}

						{/* Дополнительные инпуты */}
						{Array.from({ length: extraInputs[detailObj.label] || 0 }).map(
							(_, index) => (
								<div
									key={`${detailObj.label}_extra_${index}`}
									className='block'>
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

									{/*Дополнительный инпут */}
									<label className='flex bg-[#488aec] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
										<input
											className='hidden opacity-0'
											type='file'
											name={`${detailObj.label}_extra_${index}`}
											onChange={handleChange(detailObj.label, index)}
										/>
										<svg
											className='w-5 h-5'
											version='1.0'
											xmlns='http://www.w3.org/2000/svg'
											width='512.000000pt'
											height='512.000000pt'
											viewBox='0 0 512.000000 512.000000'
											preserveAspectRatio='xMidYMid meet'>
											<g
												transform='translate(0.000000,512.000000) scale(0.100000,-0.100000)'
												fill='#ffffff'
												stroke='none'>
												<path
													d='M661 4784 c-141 -38 -260 -148 -315 -292 l-21 -57 -3 -1440 c-2
-1012 0 -1457 8 -1497 26 -136 113 -258 231 -322 104 -58 68 -56 1241 -56
l1078 0 0 160 0 160 -1069 0 -1068 0 -34 23 c-73 49 -69 -15 -69 1020 l0 927
1760 0 1760 0 0 -585 0 -585 160 0 160 0 0 840 c0 572 -4 856 -11 892 -29 140
-127 264 -258 327 l-76 36 -842 5 -842 5 -271 210 c-149 116 -285 218 -303
228 -29 16 -77 17 -597 16 -461 0 -575 -3 -619 -15z m1376 -523 c155 -120 290
-223 300 -227 10 -5 406 -11 880 -14 l861 -5 27 -25 c42 -38 55 -80 55 -175
l0 -85 -1760 0 -1760 0 0 318 c0 354 2 364 69 409 l34 23 506 0 506 0 282
-219z'
												/>
												<path
													d='M3135 2546 c-41 -18 -83 -69 -90 -109 -9 -47 183 -1994 200 -2026 43
-84 139 -114 220 -68 35 20 65 64 247 362 114 187 213 343 220 347 7 4 180 18
385 31 420 27 422 28 462 111 36 74 22 136 -45 196 -87 78 -1454 1151 -1479
1160 -36 14 -84 12 -120 -4z m671 -827 c217 -172 391 -315 387 -319 -4 -4 -95
-12 -201 -19 -114 -6 -207 -17 -226 -25 -42 -17 -52 -31 -166 -219 -52 -86
-96 -154 -98 -152 -3 3 -102 996 -102 1028 0 9 3 17 6 17 3 0 183 -140 400
-311z'
												/>
											</g>
										</svg>
										SELECT ADDITIONAL FILE
									</label>
								</div>
							)
						)}

						{/* Кнопка для добавления нового инпута */}
						{!detailObj.title && (
							<button
								onClick={() => addExtraInput(detailObj.label)}
								className='flex bg-[#4dec48] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
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
								ADD MORE
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
