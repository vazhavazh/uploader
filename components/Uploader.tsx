"use client";

import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

interface UploaderProps {
	label: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export const Uploader = ({ label }: UploaderProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [status, setStatus] = useState<UploadStatus>("idle");
	const [uploadProgress, setUploadProgress] = useState(0);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.files) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);
			setPreview(URL.createObjectURL(selectedFile));
		}
	}

	async function handleFileUpload() {
		if (!file) return;

		setStatus("uploading");
		setUploadProgress(0);

		const formData = new FormData();
		formData.append("file", file);

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
			<p>{label}</p>
			<input
				type='file'
				onChange={handleChange}
			/>
			{file && (
				<div className='mb-4 text-sm'>
					<p>File name: {file.name}</p>
					<p>Size: {(file.size / 1024).toFixed(2)} KB</p>
					<p>Type: {file.type}</p>
				</div>
			)}

			{preview && (
				<div className='mb-4'>
					<p className='text-sm'>Image preview:</p>
					<div className='relative h-[200px] w-auto'>
						<Image
							src={preview}
							alt='Selected file'
							fill
							className='rounded border border-gray-300 object-contain'
						/>
					</div>
				</div>
			)}

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

			{file && status !== "uploading" && (
				<button
					onClick={handleFileUpload}
					className='bg-red-600 px-2 rounded'>
					Upload
				</button>
			)}

			{status === "success" && (
				<p className='text-sm text-green-600'>File upload successfully!</p>
			)}

			{status === "error" && (
				<p className='text-sm text-red-600'>Upload failed. Please try again.</p>
			)}
		</div>
	);
};
