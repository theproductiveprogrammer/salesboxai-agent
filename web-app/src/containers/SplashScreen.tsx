import { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSalesboxAuth } from '@/hooks/useSalesboxAuth'
import { useSalesboxEndpoint } from '@/hooks/useSalesboxEndpoint'
import { useDailyLeadsCache } from '@/hooks/useDailyLeadsCache'
import { fetchLeadProfile } from '@/services/dailyLeads'
import { IconLoader2 } from '@tabler/icons-react'

interface SplashScreenProps {
	onSuccess?: () => void
}

export function SplashScreen({ onSuccess }: SplashScreenProps) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [isLoadingAccount, setIsLoadingAccount] = useState(false)
	const [dataReady, setDataReady] = useState(false)
	const { login, isLoading, error: authError } = useSalesboxAuth()
	const { endpoint, setEndpoint } = useSalesboxEndpoint()
	const { fetchLeads, updateLead } = useDailyLeadsCache()

	// When isLoadingAccount becomes true, start fetching data
	useEffect(() => {
		if (!isLoadingAccount) return

		const loadData = async () => {
			try {
				console.log('[SplashScreen] Fetching daily leads...')
				const leads = await fetchLeads(true) // Force refresh, await the result
				console.log('[SplashScreen] Got leads:', leads.length)

				// Prefetch first lead's profile if available
				if (leads.length > 0) {
					const firstLead = leads[0]
					if (firstLead.leadId && !firstLead.profile) {
						try {
							console.log('[SplashScreen] Fetching profile for lead:', firstLead.leadId)
							const response = await fetchLeadProfile(firstLead.leadId)
							if (!('error' in response) && response.profile) {
								console.log('[SplashScreen] Profile fetched successfully')
								updateLead(firstLead.id, { profile: response.profile, posts: response.posts })
							}
						} catch (error) {
							console.error('[SplashScreen] Failed to prefetch profile:', error)
						}
					}
				}
			} catch (error) {
				console.error('[SplashScreen] Failed to fetch leads:', error)
			}

			// Data is ready (or failed, either way proceed)
			console.log('[SplashScreen] Data loaded, completing splash')
			onSuccess?.()
		}

		loadData()
	}, [isLoadingAccount, fetchLeads, updateLead, onSuccess])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!username.trim() || !password.trim()) {
			return
		}

		const success = await login(username, password)

		if (success) {
			// Clear form
			setUsername('')
			setPassword('')
			setShowPassword(false)

			// Start loading account data - this triggers the useEffect above
			setIsLoadingAccount(true)
		}
	}

	// Show loading account screen after successful login
	if (isLoadingAccount) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-white animate-in fade-in duration-300">
				<div className="text-center">
					{/* Logo */}
					<img
						src="/salesbox-logo.png"
						alt="SalesboxAI"
						className="h-10 mx-auto mb-6"
					/>

					{/* Welcome message */}
					<h1 className="text-2xl font-bold text-[#E755A6] mb-2">Welcome to SalesGenie</h1>

					{/* Loading indicator */}
					<div className="flex items-center justify-center gap-2 text-[#151047]/60 mt-4">
						<IconLoader2 className="h-5 w-5 animate-spin" />
						<span className="text-sm">Loading your account...</span>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 z-50 flex bg-white animate-in fade-in duration-500">
			{/* Left side - Branding */}
			<div className="hidden md:flex md:w-2/5 lg:w-1/3 bg-[#F4F5F6] flex-col pt-12 px-8 pb-8 relative overflow-hidden">
				{/* Decorative art */}
				<img
					src="/salesbox-art.png"
					alt=""
					className="absolute bottom-0 left-0 w-80 h-auto pointer-events-none"
				/>

				{/* Logo and branding */}
				<div className="relative z-10">
					<div className="flex items-center gap-3 mb-4">
						<img src="/salesbox-logo.png" alt="SalesboxAI" style={{ width: '200px', height: '23px' }} />
					</div>

					<p className="text-[#151047]/80 text-sm max-w-sm leading-relaxed mb-8">
						Welcome to SalesboxAI - a Gen AI powered Sales & Marketing platform to drive Pipeline and Revenue Growth
					</p>

					{/* Main heading */}
					<h1 className="text-3xl font-bold leading-tight">
						<span className="text-[#E755A6]">SalesGenie</span>
					</h1>
					<p className="text-base font-semibold text-[#151047]">Your AI Meeting-Maker</p>
					<p className="text-sm text-[#151047]/70 mt-2">
						The AI assistant that helps Sales Reps book more meetings, faster.
					</p>
				</div>
			</div>

			{/* Right side - Login Form */}
			<div className="w-full md:w-3/5 lg:w-2/3 flex items-center justify-center p-8 bg-white animate-in slide-in-from-right duration-700">
				<div className="w-full max-w-md">
					{/* Mobile branding - shown only on small screens */}
					<div className="md:hidden text-center mb-8">
						<div className="flex items-center justify-center gap-2 mb-4">
							<img src="/salesbox-logo.png" alt="SalesboxAI" className="h-8" />
						</div>
						<h1 className="text-2xl font-bold text-[#E755A6] mb-1">SalesGenie</h1>
						<p className="text-[#151047]/70">Your AI Meeting-Maker</p>
					</div>

					{/* Login card */}
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-[#151047] mb-2">Login to get started</h2>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<label htmlFor="endpoint" className="text-sm font-medium text-[#151047]">
									API Endpoint
								</label>
								<Input
									id="endpoint"
									type="text"
									value={endpoint}
									onChange={(e) => setEndpoint(e.target.value)}
									placeholder="https://agent.salesbox.ai"
									disabled={isLoading}
									className="font-mono text-sm border-gray-200 focus:border-[#E755A6] focus:ring-[#E755A6]/20"
								/>
								<p className="text-xs text-gray-400">
									Use http://localhost:6625/core for local development
								</p>
							</div>

							<div className="space-y-2">
								<label htmlFor="username" className="text-sm font-medium text-[#151047]">
									Username
								</label>
								<Input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Enter your username or email"
									disabled={isLoading}
									autoComplete="username"
									autoFocus
									className="border-gray-200 focus:border-[#E755A6] focus:ring-[#E755A6]/20"
								/>
							</div>

							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium text-[#151047]">
									Password
								</label>
								<div className="relative w-full">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your password"
										disabled={isLoading}
										autoComplete="current-password"
										className="pr-10 border-gray-200 focus:border-[#E755A6] focus:ring-[#E755A6]/20"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 text-gray-400"
										disabled={isLoading}
										tabIndex={-1}
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>

							{authError && (
								<div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
									{authError}
								</div>
							)}

							<Button
								type="submit"
								disabled={isLoading || !username.trim() || !password.trim()}
								className="w-full h-11 text-base font-medium bg-[#E755A6] hover:bg-[#D14A96] text-white rounded-lg"
							>
								{isLoading ? (
									<>
										<span className="animate-spin mr-2">⏳</span>
										Signing in...
									</>
								) : (
									<>
										<LogIn size={18} className="mr-2" />
										Login
									</>
								)}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}
