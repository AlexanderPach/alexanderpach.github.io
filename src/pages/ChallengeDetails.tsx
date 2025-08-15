import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ChallengeDetails: React.FC = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [upvoting, setUpvoting] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch challenge info
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;
      const { data, error } = await supabase.from('challenges').select('*').eq('id', id).single();
      if (!error) setChallenge(data);
    };
    fetchChallenge();
  }, [id]);

  // Fetch posts for this challenge and map user IDs to usernames
  useEffect(() => {
    const fetchPosts = async () => {
      if (!id) return;
      const { data, error } = await supabase.from('posts').select('*').eq('challenge_id', id).order('created_at', { ascending: false });
      if (!error) {
        setPosts(data || []);
        // Get unique user IDs from posts
        const userIds = Array.from(new Set((data || []).map((p: any) => p.user_id)));
        if (userIds.length > 0) {
          // Fetch usernames from public profiles table
          const { data: profiles } = await supabase.from('profiles').select('id,username').in('id', userIds);
          const map: Record<string, string> = {};
          profiles?.forEach((profile: any) => {
            map[profile.id] = profile.username || profile.email || profile.id;
          });
          setUserMap(map);
        }
      }
    };
    fetchPosts();
  }, [id, posting, upvoting]);

  // Calculate leaderboard
  useEffect(() => {
    const scores: Record<string, number> = {};
    posts.forEach(post => {
      if (!scores[post.user_id]) scores[post.user_id] = 0;
      scores[post.user_id] += post.upvotes || 0;
    });
    const sorted = Object.entries(scores)
      .map(([user_id, points]) => ({ user_id, points, username: userMap[user_id] || user_id }))
      .sort((a, b) => b.points - a.points);
    setLeaderboard(sorted);
  }, [posts, userMap]);

  // Add new post
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;
    setPosting(true);
    let mediaUrl = null;
    if (mediaFile) {
      setMediaUploading(true);
      const ext = mediaFile.name.split('.').pop();
      const filePath = `progress-media/${user.id}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('progress-media').upload(filePath, mediaFile);
      if (!error && data) {
        const { publicUrl } = supabase.storage.from('progress-media').getPublicUrl(filePath).data;
        mediaUrl = publicUrl;
      }
      setMediaUploading(false);
    }
    await supabase.from('posts').insert({
      challenge_id: id,
      user_id: user.id,
      content: newPost,
      upvotes: 0,
      media_url: mediaUrl,
    });
    setNewPost('');
    setMediaFile(null);
    setPosting(false);
  };

  // Upvote post
  const handleUpvote = async (post: any) => {
    if (!user) return;
    setUpvoting(post.id);
    // Prevent duplicate upvotes
    const { data: existing } = await supabase.from('post_upvotes').select('*').eq('post_id', post.id).eq('user_id', user.id).single();
    if (!existing) {
      await supabase.from('post_upvotes').insert({ post_id: post.id, user_id: user.id });
      await supabase.from('posts').update({ upvotes: (post.upvotes || 0) + 1 }).eq('id', post.id);
    }
    setUpvoting(null);
  };

  if (!challenge) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="challenges-page" style={{ padding: '2rem', maxWidth: 700, margin: '2rem auto' }}>
      <h2>{challenge.title}</h2>
      <p><strong>Created by:</strong> {challenge.creator_id}</p>
      <p><strong>Participants:</strong> {(challenge.participants && challenge.participants.length) || 0}</p>

      {/* Post form */}
      {user && (
        <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Write your progress update..."
            style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc', minHeight: 80 }}
            required
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={e => setMediaFile(e.target.files ? e.target.files[0] : null)}
            style={{ marginBottom: '0.5rem' }}
          />
          {mediaUploading && <div>Uploading media...</div>}
          <button type="submit" style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 'bold', cursor: 'pointer', width: 'fit-content' }} disabled={posting || mediaUploading}>
            {posting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {/* Posts list */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Progress Posts</h3>
        {posts.length === 0 ? <div>No posts yet.</div> : (
          posts.map(post => (
            <div key={post.id} className="progress-post">
              <div className="progress-content">{post.content}</div>
              {post.media_url && (
                post.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={post.media_url} controls style={{ maxWidth: '100%', borderRadius: 8, marginTop: '0.7rem' }} />
                ) : (
                  <img src={post.media_url} alt="Progress media" style={{ maxWidth: '100%', borderRadius: 8, marginTop: '0.7rem' }} />
                )
              )}
              <div className="progress-meta">By: {userMap[post.user_id] || post.user_id}</div>
              <div className="progress-actions">
                <span className="progress-upvotes">{post.upvotes || 0} Upvotes</span>
                {user && (
                  <>
                    <button
                      style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                      disabled={upvoting === post.id}
                      onClick={() => handleUpvote(post)}
                    >
                      ▲ Upvote
                    </button>
                    {user.id === post.user_id && (
                      <button
                        style={{ background: '#c00', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={async () => {
                          await supabase.from('posts').delete().eq('id', post.id);
                          setPosts(posts.filter(p => p.id !== post.id));
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Leaderboard */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Leaderboard</h3>
        {leaderboard.length === 0 ? <div>No points yet.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {leaderboard.map((entry, idx) => (
              <div key={entry.user_id} style={{ background: '#eee', color: '#222', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>#{idx + 1}</span>
                <span>{entry.username}</span>
                <span>{entry.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetails;
