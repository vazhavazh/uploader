// "use client";

// import { cn } from "@/lib/utils";
// import axios from "axios";
// import Image from "next/image";
// import { ChangeEvent, useState } from "react";

// interface UploaderProps {
// 	label: string;
// 	tooltip?: string;
// }

// type UploadStatus = "idle" | "uploading" | "success" | "error";

// export const Uploader = ({ label, tooltip }: UploaderProps) => {
// 	const [file, setFile] = useState<File | null>(null);
// 	const [preview, setPreview] = useState<string | null>(null);
// 	const [status, setStatus] = useState<UploadStatus>("idle");
// 	const [uploadProgress, setUploadProgress] = useState(0);
// 	const [visible, setVisible] = useState(false);

// 	function handleChange(e: ChangeEvent<HTMLInputElement>) {
// 		if (e.target.files) {
// 			const selectedFile = e.target.files[0];
// 			setFile(selectedFile);
// 			setPreview(URL.createObjectURL(selectedFile));
// 		}
// 	}

// 	async function handleFileUpload() {
// 		if (!file) return;

// 		setStatus("uploading");
// 		setUploadProgress(0);

// 		const formData = new FormData();
// 		formData.append("file", file);

// 		try {
// 			await axios.post("https://httpbin.org/post", formData, {
// 				headers: {
// 					"Content-Type": "multipart/form-data",
// 				},
// 				onUploadProgress: (progressEvent) => {
// 					const progress = progressEvent.total
// 						? Math.round((progressEvent.loaded * 100) / progressEvent.total)
// 						: 0;
// 					setUploadProgress(progress);
// 				},
// 			});

// 			setStatus("success");
// 			setUploadProgress(100);
// 		} catch (error) {
// 			setStatus("error");
// 			setUploadProgress(0);
// 			console.error(error);
// 		}
// 	}

// 	return (
// 		<div className='space-y-2'>
// 			<input
// 				type='file'
// 				onChange={handleChange}
// 				className='mr-2'
// 			/>
// 			<div className='relative inline-block'>
// 				<p
// 					className={cn(
// 						"text-green-600",
// 						tooltip && "cursor-pointer text-red-600 underline relative"
// 					)}
// 					onMouseEnter={() => setVisible(true)}
// 					onMouseLeave={() => setVisible(false)}>
// 					{label}
// 					{tooltip && visible && (
// 						<span className='absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 rounded-lg bg-gray-800 px-3 py-1 text-sm text-white shadow-lg transition-opacity duration-300 opacity-100'>
// 							{tooltip}
// 						</span>
// 					)}
// 				</p>
// 			</div>

// 			{file && (
// 				<div className='mb-4 text-sm'>
// 					<p>File name: {file.name}</p>
// 					<p>Size: {(file.size / 1024).toFixed(2)} KB</p>
// 					<p>Type: {file.type}</p>
// 				</div>
// 			)}

// 			{preview && (
// 				<div className='mb-4'>
// 					<p className='text-sm'>Image preview:</p>
// 					<div className='relative h-[200px] w-auto'>
// 						<Image
// 							src={preview}
// 							alt='Selected file'
// 							fill
// 							className='rounded border border-gray-300 object-contain'
// 						/>
// 					</div>
// 				</div>
// 			)}

// 			{status === "uploading" && (
// 				<div className='space-y-2'>
// 					<div className='h-2.5 w-full rounded-full bg-gray-200'>
// 						<div
// 							className='h-2.5 w-full rounded-full bg-blue-600 transition-all duration-300'
// 							style={{ width: `${uploadProgress}%` }}></div>
// 					</div>
// 					<p className='text-sm text-gray-600'>
// 						{uploadProgress}% upload progress
// 					</p>
// 				</div>
// 			)}

// 			{file && status !== "uploading" && (
// 				<button
// 					onClick={handleFileUpload}
// 					className='bg-yellow-600 px-2 rounded'>
// 					Upload
// 				</button>
// 			)}

// 			{status === "success" && (
// 				<p className='text-sm text-green-600'>File upload successfully!</p>
// 			)}

// 			{status === "error" && (
// 				<p className='text-sm text-red-600'>Upload failed. Please try again.</p>
// 			)}
// 		</div>
// 	);
// };

"use client";

import { cn } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

interface UploaderProps {
	labels: string[]; // Массив меток для каждого инпута
	tooltips?: string[]; // Опциональный массив подсказок для каждого инпута
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export const MultiUploader = ({ labels, tooltips = [] }: UploaderProps) => {
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [status, setStatus] = useState<UploadStatus>("idle");
	const [uploadProgress, setUploadProgress] = useState(0);
	// const [visible, setVisible] = useState(false);

	// Обработчик изменений для каждого инпута
	function handleChange(index: number) {
		return (e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files[0]) {
				const selectedFile = e.target.files[0];
				const newFiles = [...files];
				newFiles[index] = selectedFile;
				setFiles(newFiles);

				const newPreviews = [...previews];
				newPreviews[index] = URL.createObjectURL(selectedFile);
				setPreviews(newPreviews);
			}
		};
	}

	async function handleFileUpload() {
		setStatus("uploading");
		setUploadProgress(0);

		const formData = new FormData();
		files.forEach((file) => formData.append("files", file));

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
			{labels.map((label, index) => (
				<div
					key={index}
					className='space-y-2'>
					<input
						type='file'
						onChange={handleChange(index)}
						className='mr-2'
					/>
					<div className='relative inline-block'>
						<p
							className={cn(
								"text-green-600",
								tooltips[index] &&
									"cursor-pointer text-red-600 underline relative"
							)}
							// onMouseEnter={() => setVisible(true)}
							// onMouseLeave={() => setVisible(false)}
						>
							{label}
							{tooltips[index] && (
								<span className='absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 rounded-lg bg-gray-800 px-3 py-1 text-sm text-white shadow-lg transition-opacity duration-300 opacity-100'>
									{tooltips[index]}
								</span>
							)}
						</p>
					</div>

					{files[index] && (
						<div className='mb-4 text-sm'>
							<p>File name: {files[index].name}</p>
							<p>Size: {(files[index].size / 1024).toFixed(2)} KB</p>
							<p>Type: {files[index].type}</p>
						</div>
					)}

					{previews[index] && (
						<div className='mb-4'>
							<p className='text-sm'>Image preview:</p>
							<div className='relative h-[200px] w-auto'>
								<Image
									src={previews[index]}
									alt={`Selected file ${index}`}
									fill
									className='rounded border border-gray-300 object-contain'
								/>
							</div>
						</div>
					)}
				</div>
			))}

			{status === "uploading" && (
				<div className='space-y-2'>
					<div className='h-2.5 w-full rounded-full bg-gray-200'>
						<div
							className='h-2.5 w-full rounded-full bg-blue-600 transition-all duration-300'
							style={{ width: `${uploadProgress}%` }}></div>
					</div>
					<p className='text-sm text-gray-600'>
						{uploadProgress}% upload progress
					</p>
				</div>
			)}

			{files.length > 0 && status !== "uploading" && (
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
