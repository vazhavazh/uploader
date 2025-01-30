
"use client";

import { cn } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

interface UploaderProps {
	labels: string[];
	tooltips?: string[];
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export const MultiUploader = ({ labels, tooltips = [] }: UploaderProps) => {
	const [files, setFiles] = useState<{ [key: string]: File }>({});
	const [previews, setPreviews] = useState<{ [key: string]: string }>({});
	const [status, setStatus] = useState<UploadStatus>("idle");
	const [uploadProgress, setUploadProgress] = useState(0);

	function handleChange(name: string) {
		return (e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files[0]) {
				const selectedFile = e.target.files[0];

				// Очистка старого preview (важно для предотвращения утечек памяти)
				if (previews[name]) {
					URL.revokeObjectURL(previews[name]);
				}

				setFiles((prev) => ({
					...prev,
					[name]: selectedFile,
				}));

				setPreviews((prev) => ({
					...prev,
					[name]:
						selectedFile.type === "application/pdf"
							? "/assets/img/pdf.png" // путь в public
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

	return (
		<div className='space-y-2'>
			{labels.map((label, index) => {
				const name = `file-${index}`;

				return (
					<div
						key={name}
						className='space-y-2'>
						<input
							type='file'
							name={name}
							onChange={handleChange(name)}
						/>
						<div className='relative inline-block'>
							<p
								className={cn(
									"text-green-600",
									tooltips[index] && "cursor-pointer text-red-600 underline"
								)}>
								{label}
								{tooltips[index] && (
									<span className='absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 rounded-lg bg-gray-800 px-3 py-1 text-sm text-white shadow-lg transition-opacity duration-300 opacity-100'>
										{tooltips[index]}
									</span>
								)}
							</p>
						</div>

						{previews[name] && (
							<div className='mb-4'>
								<p className='text-sm'>Preview:</p>
								<div className='relative h-[200px] w-auto'>
									<Image
										src={previews[name]}
										alt={`Selected file ${index}`}
										fill
										className='rounded border border-gray-300 object-contain'
									/>
								</div>
							</div>
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
