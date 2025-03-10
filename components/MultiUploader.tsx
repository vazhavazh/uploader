"use client";

// import { cn } from "@/lib/utils";
import { DetailObj } from "@/types/detail-obj";
import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useCallback, useState } from "react";
import { ToastAction } from "./ui/toast";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

	// function handleChange(label: string, index?: number) {
	// 	return (e: ChangeEvent<HTMLInputElement>) => {
	// 		if (e.target.files && e.target.files[0]) {
	// 			const selectedFile = e.target.files[0];
	// 			const key = index !== undefined ? `${label}_${index}` : label; // Генерируем уникальный ключ

	// 			const fileName = selectedFile.name;

	// 			// Очистка старого preview (важно для предотвращения утечек памяти)
	// 			if (previews[key]) {
	// 				URL.revokeObjectURL(previews[key]);
	// 			}

	// 			setFiles((prev) => ({
	// 				...prev,
	// 				[key]: selectedFile,
	// 			}));

	// 			setPreviews((prev) => ({
	// 				...prev,
	// 				[key]:
	// 					selectedFile.type === "application/pdf"
	// 						? "/assets/img/pdf.png"
	// 						: URL.createObjectURL(selectedFile),
	// 			}));

	// 			setFileNames((prev) => ({
	// 				...prev,
	// 				[key]: fileName,
	// 			}));
	// 		}
	// 	};
	// }

	const handleChange = useCallback(
		(label: string, index?: number) => (e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files[0]) {
				const selectedFile = e.target.files[0];
				const key = index !== undefined ? `${label}_${index}` : label;

				const fileName = selectedFile.name;

				// Очистка старого preview
				setPreviews((prev) => {
					if (prev[key]) {
						URL.revokeObjectURL(prev[key]);
					}
					return {
						...prev,
						[key]:
							selectedFile.type === "application/pdf"
								? "/assets/img/pdf.png"
								: URL.createObjectURL(selectedFile),
					};
				});

				setFiles((prev) => ({
					...prev,
					[key]: selectedFile,
				}));

				setFileNames((prev) => ({
					...prev,
					[key]: fileName,
				}));
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[previews] // Завися только от previews
	);

	// function addExtraInput(label: string) {
	// 	setExtraInputs((prev) => ({
	// 		...prev,
	// 		[label]: (prev[label] || 0) + 1, // Увеличиваем количество инпутов для конкретного label
	// 	}));
	// }
	const addExtraInput = useCallback((label: string) => {
		setExtraInputs((prev) => ({
			...prev,
			[label]: (prev[label] || 0) + 1,
		}));
	}, []);

	function resetUploader() {
		setFiles({});
		setPreviews({});
		setStatus("idle");
		setUploadProgress(0);
		setExtraInputs({});
		setFileNames({});
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
			toast({
				variant: "success",
				title: "Well done!",
				description: "All files uploaded successfully.",
			});
			resetUploader();
		} catch (error) {
			setStatus("error");
			setUploadProgress(0);
			console.error(error);
			toast({
				variant: "error",
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with uploading files on server.",
				action: <ToastAction altText='Try again'>Please try again</ToastAction>,
			});
		}
	}

	const canUploadAll = details
		.filter((detailObj) => !detailObj.title)
		.every((detailObj) => {
			// Проверяем, есть ли файл для основного инпута
			if (files[detailObj.label]) {
				return true;
			}

			// Проверяем, есть ли файлы для дополнительных инпутов
			for (let i = 0; i < (extraInputs[detailObj.label] || 0); i++) {
				if (files[`${detailObj.label}_${i}`]) {
					return true;
				}
			}

			return false;
		});

	return (
		<div className='space-y-6 xl:space-y-8'>
			{details.map((detailObj) => {
				return (
					<div
						key={detailObj.label}
						className={cn(
							"space-y-3 xl:space-y-6",
							previews[detailObj.label] &&
								"md:flex flex-wrap justify-center gap-5 xl:gap-9 items-center"
						)}>
						{detailObj.tooltip ? (
							<>
								<Accordion
									type='single'
									collapsible
									className='w-full'>
									<AccordionItem value='item-1'>
										<AccordionTrigger>
											<p
												className={cn(
													"text-base underline w-full xl:text-xl",
													previews[detailObj.label] && "text-center"
												)}>{`${detailObj.id} ${detailObj.label}`}</p>
										</AccordionTrigger>
										<AccordionContent>
											<p className='whitespace-pre-line xl:text-base'>{detailObj.tooltip}</p>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</>
						) : (
							<p
								className={cn(
									"w-full xl:text-xl",
									previews[detailObj.label] && "text-center"
								)}>{`${detailObj.id} ${detailObj.label}`}</p>
						)}

						<div
							className={cn(
								"block  ",
								previews[detailObj.label] &&
									"border-2 border-slate-900 rounded-xl p-1 md:p-3 md:w-[calc(50%-10px)] xl:w-[calc(32%-10px)] md:h-[22rem] md:flex md:flex-col lg:h-[24rem]"
							)}>
							{/* Отображение имени файла для основного инпута */}
							{fileNames[detailObj.label] && (
								<p className='text-sm font-bold text-red-600 text-center mb-2 md:mb-auto'>
									Selected file: {fileNames[detailObj.label]}
								</p>
							)}
							{/* Превью для основного инпута */}
							{previews[detailObj.label] && (
								<div className='mb-4'>
									{/* <p className='text-sm'>Preview:</p> */}
									<div className='relative h-[200px] lg:h-[16rem]  w-auto'>
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
								<div className='flex justify-center mt-auto'>
									<label className='min-w-[250px] max-w-[250px] xl:min-w-[22rem] xl:max-w-[22rem] xl:text-base  justify-center flex bg-[#488aec] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
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
								</div>
							)}
						</div>

						{/* Дополнительные инпуты */}
						{Array.from({ length: extraInputs[detailObj.label] || 0 }).map(
							(_, index) => (
								<div
									key={`${detailObj.label}_extra_${index}`}
									className={cn(
										"block  ",
										previews[`${detailObj.label}_${index}`] &&
											"border-2 border-slate-900 rounded-xl p-1 md:p-3 md:w-[calc(50%-10px)] xl:w-[calc(32%-10px)] md:h-[22rem] md:flex md:flex-col lg:h-[24rem]"
									)}>
									{/* Отображение имени файла для дополнительного инпута */}
									{fileNames[`${detailObj.label}_${index}`] && (
										<p className='text-sm font-bold text-red-600 text-center mb-2 md:mb-auto'>
											Selected file: {fileNames[`${detailObj.label}_${index}`]}
										</p>
									)}

									{/* Превью для дополнительного инпута */}

									{previews[`${detailObj.label}_${index}`] && (
										<div className='mb-4'>
											<div className='relative h-[200px] lg:h-[16rem]  w-auto'>
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
									<div className='flex justify-center mt-auto'>
										<label className='min-w-[250px] max-w-[250px] xl:min-w-[22rem] xl:max-w-[22rem] xl:text-base  justify-center flex bg-[#488aec] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
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
								</div>
							)
						)}

						{/* Кнопка для добавления нового инпута */}
						{!detailObj.title && (
							<div className='flex justify-center'>
								<button
									onClick={() => addExtraInput(detailObj.label)}
									className='max-w-[250px] justify-center min-w-[250px] xl:min-w-[22rem] xl:max-w-[22rem] xl:text-base flex bg-[#ffe30f] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
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
							</div>
						)}
					</div>
				);
			})}

			{status === "uploading" && (
				<div className='space-y-2'>
					<div className='h-2.5 w-full rounded-full bg-gray-200'>
						<div
							className='h-3.5 rounded-full bg-[#488aec] transition-all duration-300'
							style={{ width: `${uploadProgress}%` }}></div>
					</div>
					<p className='text-base font-extrabold text-gray-700 text-center uppercase'>
						upload progress {uploadProgress}%
					</p>
				</div>
			)}

			{/* {Object.values(files).length > 0 && status !== "uploading" && (
				<div className='flex justify-center'>
					<button
						onClick={handleFileUpload}
						className='max-w-[250px] justify-center min-w-[250px] flex bg-[#ec4848] text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none'>
						Upload All Files
					</button>
				</div>
			)} */}
			{status !== "uploading" && (
				<div className='flex justify-center'>
					<button
						disabled={!canUploadAll}
						onClick={handleFileUpload}
						className={`${
							canUploadAll ? "bg-[#4dec48]" : "bg-gray-400 cursor-not-allowed"
						} max-w-[250px] justify-center min-w-[250px] xl:min-w-[22rem] xl:max-w-[22rem] xl:text-base flex text-white text-xs leading-4 font-bold text-center cursor-pointer uppercase align-middle items-center select-none gap-3 shadow-[0_4px_6px_-1px_#488aec31,0_2px_4px_-1px_#488aec17] transition-all duration-[0.6s] ease-[ease] px-6 py-3 rounded-lg border-[none] hover:shadow-[0_10px_15px_-3px_#488aec4f,0_4px_6px_-2px_#488aec17] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none`}>
						UPLOAD ALL
					</button>
				</div>
			)}
		</div>
	);
};
