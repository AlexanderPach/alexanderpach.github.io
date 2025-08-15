import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { supabase } from '../supabaseClient';


const Navbar: React.FC = () => {
const [darkMode, setDarkMode] = React.useState<boolean>(false);
const navigate = useNavigate();
const [hover, setHover] = React.useState(false);
const [menuOpen, setMenuOpen] = React.useState(false);
const buttonRef = React.useRef<HTMLButtonElement>(null);
const menuRef = React.useRef<HTMLDivElement>(null);
const [loginHover, setLoginHover] = React.useState(false);
const [signupHover, setSignupHover] = React.useState(false);
const [settingsHover, setSettingsHover] = React.useState(false);
const [darkModeHover, setDarkModeHover] = React.useState(false);
const [logoutHover, setLogoutHover] = React.useState(false);
const [user, setUser] = React.useState<any>(null);
const [username, setUsername] = React.useState<string>('');

	React.useEffect(() => {
		const getUser = async () => {
			const { data } = await supabase.auth.getUser();
			setUser(data.user);
			if (data.user) {
				// Try to get username from profiles table
				const { data: profile } = await supabase.from('profiles').select('username').eq('id', data.user.id).single();
				setUsername(profile?.username || '');
			} else {
				setUsername('');
			}
		};
		getUser();
		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				supabase.from('profiles').select('username').eq('id', session.user.id).single().then(({ data: profile }) => {
					setUsername(profile?.username || '');
				});
			} else {
				setUsername('');
			}
		});
		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

		React.useEffect(() => {
			if (darkMode) {
				document.body.classList.add('dark-mode');
			} else {
				document.body.classList.remove('dark-mode');
			}
		}, [darkMode]);

	React.useEffect(() => {
		if (!menuOpen) return;
		const handleClick = (e: MouseEvent) => {
			if (
				buttonRef.current && buttonRef.current.contains(e.target as Node)
			) return;
			if (
				menuRef.current && menuRef.current.contains(e.target as Node)
			) return;
			setMenuOpen(false);
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [menuOpen]);
	return (
		<nav style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '1rem 2rem',
			background: '#222',
			color: '#fff',
		}}>
			<div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
				Fitness Rivalry
			</div>
			<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
				<Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
				<Link to="/challenges" style={{ color: '#fff', textDecoration: 'none' }}>Challenges</Link>
				<Link to="/stats" style={{ color: '#fff', textDecoration: 'none' }}>Stats</Link>
												<div style={{ position: 'relative' }}>
													<button
														ref={buttonRef}
														style={{
															background: hover ? 'rgba(255,255,255,0.3)' : 'transparent',
															border: 'none',
															color: '#fff',
															cursor: 'pointer',
															display: 'flex',
															alignItems: 'center',
															padding: 0
														}}
														onMouseEnter={() => setHover(true)}
														onMouseLeave={() => setHover(false)}
														onClick={() => setMenuOpen((open) => !open)}
													>
														<CgProfile size={24} />
													</button>
													{menuOpen && (
														<div
															ref={menuRef}
															style={{
																position: 'absolute',
																top: '110%',
																right: 0,
																background: 'rgba(255,255,255,0.95)',
																boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
																borderRadius: '8px',
																padding: '1rem',
																minWidth: '180px',
																display: 'flex',
																flexDirection: 'column',
																gap: '0.5rem',
																zIndex: 100
															}}
														>
															{user ? (
																<>
																	{/* Show username at top of menu */}
																	<div style={{ fontWeight: 'bold', color: '#222', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', textAlign: 'center' }}>
																		{username ? `@${username}` : user.email}
																	</div>
																	<button
																		style={{
																			background: settingsHover ? '#222' : '#fff',
																			color: settingsHover ? '#fff' : '#222',
																			border: '1px solid #222',
																			borderRadius: '4px',
																			padding: '0.5rem',
																			cursor: 'pointer',
																			transition: 'background 0.2s, color 0.2s'
																		}}
																		onMouseEnter={() => setSettingsHover(true)}
																		onMouseLeave={() => setSettingsHover(false)}
																		onClick={() => { setMenuOpen(false); navigate('/settings'); }}
																	>
																		Settings
																	</button>
														<button
															style={{
																background: darkModeHover ? '#222' : '#fff',
																color: darkModeHover ? '#fff' : '#222',
																border: '1px solid #222',
																borderRadius: '4px',
																padding: '0.5rem',
																cursor: 'pointer',
																transition: 'background 0.2s, color 0.2s'
															}}
															onMouseEnter={() => setDarkModeHover(true)}
															onMouseLeave={() => setDarkModeHover(false)}
															onClick={() => { setMenuOpen(false); setDarkMode((prev) => !prev); }}
														>
															{darkMode ? 'Light Mode' : 'Dark Mode'}
														</button>
																	<button
																		style={{
																			background: logoutHover ? '#222' : '#fff',
																			color: logoutHover ? '#fff' : '#222',
																			border: '1px solid #222',
																			borderRadius: '4px',
																			padding: '0.5rem',
																			cursor: 'pointer',
																			transition: 'background 0.2s, color 0.2s'
																		}}
																		onMouseEnter={() => setLogoutHover(true)}
																		onMouseLeave={() => setLogoutHover(false)}
																		onClick={async () => { setMenuOpen(false); await supabase.auth.signOut(); navigate('/'); }}
																	>
																		Log Out
																	</button>
																</>
															) : (
																<>
																	<button
																		style={{
																			background: loginHover ? '#222' : '#fff',
																			color: loginHover ? '#fff' : '#222',
																			border: '1px solid #222',
																			borderRadius: '4px',
																			padding: '0.5rem',
																			cursor: 'pointer',
																			transition: 'background 0.2s, color 0.2s'
																		}}
																		onMouseEnter={() => setLoginHover(true)}
																		onMouseLeave={() => setLoginHover(false)}
																		onClick={() => { setMenuOpen(false); navigate('/auth'); }}
																	>
																		Login
																	</button>
																	<button
																		style={{
																			background: signupHover ? '#222' : '#fff',
																			color: signupHover ? '#fff' : '#222',
																			border: '1px solid #222',
																			borderRadius: '4px',
																			padding: '0.5rem',
																			cursor: 'pointer',
																			transition: 'background 0.2s, color 0.2s'
																		}}
																		onMouseEnter={() => setSignupHover(true)}
																		onMouseLeave={() => setSignupHover(false)}
																		onClick={() => { setMenuOpen(false); navigate('/auth', { state: { signUp: true } }); }}
																	>
																		Sign Up
																	</button>
																</>
															)}
														</div>
													)}
												</div>
			</div>
		</nav>
	);
};

export default Navbar;
