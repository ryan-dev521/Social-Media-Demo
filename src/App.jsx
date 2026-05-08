import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './client' // const supabase = createClient(URL, API_KEY)
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation, redirect} from 'react-router-dom'
import * as webllm from "@mlc-ai/web-llm";

let engine = null;

/*
Qwen2-0.5B-Instruct-q4f32_1-MLC
Qwen2-1.5B-Instruct-q4f16_1-MLC
Qwen2-7B-Instruct-q4f16_1-MLC

Llama-3.2-1B-Instruct-q4f16_1-MLC
Llama-3.2-3B-Instruct-q4f16_1-MLC
Llama-3.1-8B-Instruct-q4f32_1-MLC
Llama-2-7b-chat-hf-q4f16_1-MLC
*/ 

export const getEngine = async () => {
  if (!engine) {
    engine = await webllm.CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC");
  }
  return engine;
};

// table: birdPosts (id, created_at, title, body, imgURL, likes, parentID, userID)
// table: birdLikesTable (id, created_at, postID, userID)

function App() {
  //const TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"
  const [posts, setPosts] = useState([{text:""}])
  const [username, setUsername] = useState("")
  //const [loggedIn, setLoggedIn] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => {
  return !!localStorage.getItem("userID")
  })
  const [userID, setUserID] = useState(() => {
    return localStorage.getItem("userID" || "")
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [sortBy, setSortBy] = useState("created_at")
  const [deleteMessage, setDeleteMessage] = useState("")

  useEffect(() => {
    if (userID) {
      localStorage.setItem("userID", userID)
      setLoggedIn(true)
    }
  }, [userID])

  useEffect(() => {
    const fetchPosts = async () => {
      const {data, error} = await supabase
        .from("birdPosts")
        .select("*")
        .order(sortBy, {ascending: false})

      if (error) {
        setPosts(data)
        console.log(error)
        return
      }

       setPosts(data)
       console.log(data)


    }

    fetchPosts()


  }, [sortBy, refreshKey])

  useEffect(() => {
    supabase.auth.getSession()
  }, [])

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUserID(session.user.id)
          setLoggedIn(true)
        } else {
          setUserID("")
          setLoggedIn(false)
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])


  return (
    <div className="bg-gray-800 min-h-screen text-gray-100 w-full pt-16">
      <div className="fixed top-0 h-14 bg-gray-950 w-full text-center text-2xl">
        <Link to="/">
          <div className="inline-block px-4 py-2 hover:bg-gray-500 hover:cursor-pointer rounded">
            Social Media{/* Bird App */}
          </div>
        </Link>
      </div>
      <div className="fixed top-0 right-8 m-2 z-10">
        {!loggedIn && <div className="flex items-center justify-center">
          <Link to="/signup">
            <div className="p-2 border-2 mt-0 ms-2 text-gray-200 border-gray-200 rounded-2xl hover:bg-gray-500 hover:cursor-pointer">Sign Up</div>
          </Link>
          <Link to="/login">
            <div className="p-2 border-2 mt-0 ms-2 text-gray-200 border-gray-200 rounded-2xl hover:bg-gray-500 hover:cursor-pointer">Log In</div>
          </Link>
        </div>}
        {loggedIn && <div className="p-2 border-2 mt-0 ms-2 text-gray-200 border-gray-200 rounded-2xl hover:bg-gray-500 hover:cursor-pointer" onClick={() => handleSignOut(setUserID, setUsername, setLoggedIn)}>Sign Out</div>}
      </div>
      <div className="fixed bottom-2 left-2 text-md w-1/12">User ID: {userID}</div>
      {deleteMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-8 rounded">
          {deleteMessage}
          <div className="absolute rounded-full p-4 top-0 right-0 hover:cursor-pointer hover:bg-gray-500" onClick={() => setDeleteMessage("")}>
            x
          </div>
        </div>
      )}


      <Routes>

        <Route path="/" element={<Home posts={posts} userID={userID} setSortBy={setSortBy} deleteMessage={deleteMessage} setDeleteMessage={setDeleteMessage} setRefreshKey={setRefreshKey}/>}/>

        <Route path="/post/:id" element={<PostPage userID={userID} setDeleteMessage={setDeleteMessage}/>}/>

        <Route path="/create" element={<Create userID={userID} setRefreshKey={setRefreshKey}/>}/>

        <Route path="/create/:parentID" element={<Create userID={userID} setRefreshKey={setRefreshKey}/>}/>

        <Route path="/search/:searchTerm" element={<SearchPage userID={userID} setDeleteMessage={setDeleteMessage}/>}/>

        <Route path="/edit/:editID" element={<EditPage userID={userID} setRefreshKey={setRefreshKey}/>}/>

        <Route path="/signup" element={<SignUpPage setUsername={setUsername} setUserID={setUserID} setLoggedIn={setLoggedIn}/>}></Route>

        <Route path="/login" element={<LoginPage setUsername={setUsername} setUserID={setUserID} setLoggedIn={setLoggedIn}/>}></Route>

        <Route path="/reset-password" element={<ResetPasswordPage/>}/>
      </Routes>
    </div>
  )
}

const Home = ({posts, userID, setSortBy, deleteMessage, setDeleteMessage, setRefreshKey}) => {
  const location = useLocation();

  const [showSortBy, setShowSortBy] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    console.log("delete message " + deleteMessage)
  }, [deleteMessage])

  return (
    <div className="flex flex-col items-center w-full pt-16">
      <div className="flex justify-center items-center">
        <input type="text" className="bg-gray-400 text-gray-800 p-4 m-4 w-64 rounded-2xl" onChange={(e) => setSearchTerm(e.target.value)}></input>
        <Link to={`/search/${searchTerm}`}>
          <div className="m-4 bg-blue-400 hover:bg-gray-700 rounded-2xl w-24 text-center p-4">Search</div>
        </Link>
      </div>
      <div className="flex flex-col bg-gray-950 rounded-md w-1/3 text-center">
        <div className="hover:cursor-pointer hover:bg-gray-700 p-2" onClick={() => setShowSortBy(s => !s)}>Sort by &dArr;</div>
        {showSortBy && ( <><div className="hover:cursor-pointer hover:bg-gray-700 p-2" onClick={() => setSortBy("created_at")}>Time</div>
        <div className="hover:cursor-pointer hover:bg-gray-700 p-2" onClick={() => setSortBy("likes")}>Upvotes</div></>)}

      </div>
      <Link to="/create">
        <div className="m-4 bg-blue-400 hover:bg-gray-700 rounded-2xl w-64 text-center p-4">create post</div>
      </Link>

      {posts
        .filter(post => !post.parentID)
        .map(post => (
          <PostCard key={post.id} post={post} userID={userID} setDeleteMessage={setDeleteMessage} />
        ))
      }


    </div>
  )
}

const SearchPage = ({userID, setDeleteMessage}) => {
  let isMounted = true
  const navigate = useNavigate()

  const { searchTerm } = useParams()
  const [results, setResults] = useState([])
    useEffect(() => {
      const fetchSearch = async () => {
      const { data, error } = await supabase
        .from("birdPosts")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`)

        if (!error) {
          setResults(data)
        }
    }

    fetchSearch()

    console.log(results)

    return () => {
      isMounted = false
    }
    }, [searchTerm])


  return (
    <div className="flex flex-col items-center w-full pt-16">
      <div onClick={() => navigate(-1)} className="fixed text-2xl p-8 top-16 left-4 rounded-full hover:cursor-pointer hover:bg-gray-700">
        &#x2b05;
      </div>
      <div className="text-2xl text-gray-200 m-4">
        Results
      </div>
      {results.map((result, idx) => (
        <PostCard post={result} userID={userID} setDeleteMessage={setDeleteMessage}/>
      ))}
    </div>
  )
}

const PostCard = ({post, userID, setDeleteMessage}) => {
  const [likes, setLikes] = useState(post?.likes || 0)

  useEffect(() => {
    if (!post?.id) return

    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from("birdLikesTable")
        .select("id")
        .eq("postID", post.id)

        
      if (!error) {
        setLikes(data.length)
      }

    }


    fetchLikes()
  }, [post.id])

  return (

      <div className="flex flex-col items-center justify-center w-1/2 text-gray-200 pb-2 rounded-sm border border-gray-200">
        <Link to={`/post/${post.id}`} className="w-full pb-2 hover:cursor-pointer hover:bg-gray-700 flex flex-col items-center justify-center">
          {/* <div>{post.id}</div> */}
          {post.userID ? <div>User: {post.userID}</div> : <div>Anonymous</div>}
          <div className="text-2xl font-bold">Title: {post.title}</div>
          <div>{post.body}</div>
          <img className="m-2" src={post.imgURL}></img>
        </Link>
        <div className="flex items-center justify-center">
          <div className="bg-red-500 p-2 rounded-md hover:cursor-pointer hover:bg-red-800" onClick={(e) => {e.stopPropagation(); handleLikeSubmit(post.id, userID, likes, setLikes)}}>Like</div>
          <div className="p-2 rounded-md">{likes}</div>
          <Link to={`/create/${post.id}`}>
            <div className="bg-blue-400 p-2 ms-4 rounded-md hover:cursor-pointer hover:bg-gray-700">
              Reply
            </div>
          </Link>
        </div>
        {post.userID && post.userID === userID && <div className="flex items-center justify-center m-4">
          <Link to={`/edit/${post.id}`}>
            <div className="bg-green-500 p-2 rounded-md hover:cursor-pointer hover:bg-green-700">Edit</div>
          </Link>
          <div className="bg-purple-500 p-2 ms-6 rounded-md hover:cursor-pointer hover:bg-purple-700" onClick={() => handleDelete(post, setDeleteMessage)}>Delete</div>
        </div>}
        <div className="flex items-center justify-center">Post created: {String(post.created_at).slice(0, 10)} at {String(post.created_at).slice(11, 19)} UTC</div>
      </div>

  )
}

const Create = ({userID=null, setRefreshKey}) => {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imgURL, setImgUrl] = useState("")

  const navigate = useNavigate()
  const { parentID } = useParams()

  const handlePostSubmit = async () => {
  

  if (!title || title.trim() === "") {
    alert("Title cannot be empty.")
    return
  }

  if (!body || body.trim() === "") {
    alert("Body cannot be empty.")
    return
  }

  // let { data: { user } } = await supabase.auth.getUser()
  // let { data: { session } } = await supabase.auth.getSession()
  // var { data, error } = await supabase.rpc('debug_auth')

  // console.log("USER:", user)
  // console.log("SESSION:", session)
  // console.log("data: ", data)

  // console.log("FULL ERROR:", error)
  // console.log("MESSAGE:", error?.message)
  // console.log("DETAIL:", error?.details)
  // console.log("HINT:", error?.hint)
  // console.log("CODE:", error?.code)


  const {data, error} = await supabase
    .from("birdPosts")
    .insert([
      {
        title: title,
        body: body,
        imgURL: imgURL, 
        likes: 0,
        userID: userID,
        parentID: parentID || null
      }
    ])
    .select()

    if (error) {
      alert(String(error) + "Error creating post")
      return
    }

    console.log("inserted", data)
    setRefreshKey(prev => prev + 1)

    setTimeout(() => {
      navigate("/")
    }, 300);
    


  }
  

  return (
    <div>
      {((userID == null) || (userID =="")) && 
      <div className="flex flex-col justify-center items-center">
        <div className="text-2xl text-gray-200 m-64">Log In to create Post: </div>
        <div onClick={() => navigate(-1)} className="fixed text-2xl p-8 top-16 left-4 rounded-full hover:cursor-pointer hover:bg-gray-700">
          &#x2b05;
        </div>
      </div>}
      {((userID != null) && (userID !="")) &&
      <div className="flex flex-col justify-center items-center">
        <div onClick={() => navigate(-1)} className="fixed text-2xl p-8 top-16 left-4 rounded-full hover:cursor-pointer hover:bg-gray-700">
          &#x2b05;
        </div>
        {parentID == null ? <div className="m-4 text-2xl">New Post</div> : <div className="m-4 text-2xl">Replying to Post ID: {parentID}</div>}
        <div className="m-2">Title:</div> 
        <input type="text" className="bg-gray-500 text-gray-100 p-4 w-64 rounded-md resize-none text-start" onChange={(e) => setTitle(e.target.value)}></input>
        <div className="m-2">Body:</div> 
        <textarea className="bg-gray-500 text-gray-100 p-4 w-64 h-96 rounded-md resize-none text-start" onChange={(e) => setBody(e.target.value)}></textarea>
        <div className="m-2">Image Url:</div> 
        <input type="text" className="bg-gray-500 text-gray-100 p-4 w-64 rounded-md resize-none text-start" onChange={(e) => setImgUrl(e.target.value)}></input>
        <div className="m-4 p-4 bg-blue-400 hover:bg-gray-700 hover:cursor-pointer rounded-2xl w-64 h-12 flex items-center justify-center" onClick={() => handlePostSubmit()}>
          <div>Submit</div>
        </div>
      </div>}
    </div>
    )

    

    
}

const EditPage = ({userID=null, setRefreshKey}) => {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imgURL, setImgUrl] = useState("")

  const navigate = useNavigate()
  const { editID } = useParams()
  console.log(editID)

  const handlePostSubmit = async () => {
  

  if (!title || title.trim() === "") {
    alert("Title cannot be empty.")
    return
  }

  if (!body || body.trim() === "") {
    alert("Body cannot be empty.")
    return
  }

  const {data, error} = await supabase
    .from("birdPosts")
    .update(
      {
        title,
        body,
        imgURL
      }
    )
    .eq("id", editID)

    if (error) {
      alert(String(error) + "Error editing post")
      return
    }

    console.log("Edited", data)
    
    console.log("inserted", data)
    setRefreshKey(prev => prev + 1)

    setTimeout(() => {
      navigate("/")
    }, 300);


  }

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("birdPosts")
        .select("*")
        .eq("id", editID)
        .single()

      if (data) {
        setTitle(data.title)
        setBody(data.body)
        setImgUrl(data.imgURL)
      }

      if (error || !data) {
        console.log(error)
        return
      }
    }

    if (editID) fetchPost()
  }, [editID])
  

  return (
  <div className="flex flex-col justify-center items-center">
    <div onClick={() => navigate(-1)} className="fixed text-2xl p-8 top-16 left-4 rounded-full hover:cursor-pointer hover:bg-gray-700">
      &#x2b05;
    </div>
    {editID == null ? <div className="m-4 text-2xl">Couldn't find post</div> : <div className="m-4 text-2xl">Editing post ID:  {editID}</div>}
    <div className="m-2">Title:</div> 
    <input type="text" value={title} className="bg-gray-500 text-gray-100 p-4 w-64 rounded-md resize-none text-start" onChange={(e) => setTitle(e.target.value)}></input>
    <div className="m-2">Body:</div> 
    <textarea value={body} className="bg-gray-500 text-gray-100 p-4 w-64 h-96 rounded-md resize-none text-start" onChange={(e) => setBody(e.target.value)}></textarea>
    <div className="m-2">Image Url:</div> 
    <input type="text" value={imgURL} className="bg-gray-500 text-gray-100 p-4 w-64 rounded-md resize-none text-start" onChange={(e) => setImgUrl(e.target.value)}></input>
    <div className="m-4 p-4 bg-blue-400 hover:bg-gray-700 hover:cursor-pointer rounded-2xl w-64 h-12 flex items-center justify-center" onClick={() => handlePostSubmit()}>
      <div>Submit</div>
    </div>

  </div>
    )
}

const PostPage = ({userID, setDeleteMessage}) => {

  const [post, setPost] = useState({})
  const [replies, setReplies] = useState([])
  const [thread, setThread] = useState([])
  const navigate = useNavigate()

  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false); // for llm
  
  const { id } = useParams()
  useEffect(() => {
    const fetchPost = async (root=true, currID=id) => {

    const { data, error } = await supabase 
      .from("birdPosts")
      .select("*")
      .eq("id", currID)
      .single()

      if (error) {
        console.error(error)
        return
      }


      setPost(data)
      fetchReplies(data)
      fetchThread(data)
      console.log(data)

    }

    const fetchReplies = async (post) => {
      const { data, error } = await supabase 
        .from("birdPosts")
        .select("*")
        .eq("parentID", post.id)

      if (error) {
        console.error(error)
        return
      }

      setReplies(data)
    }

    const fetchThread = async (startPost) => {
      const chain = []
      let current = startPost

      while (current) {
        chain.unshift(current)

        if (!current.parentID) break

        const { data } = await supabase
          .from("birdPosts")
          .select("*")
          .eq("id", current.parentID)
          .single()

        current = data
      }

      setThread(chain)
    }
   
    fetchPost()
    //fetchThread(data)
    console.log("thread: ", thread)
  }, [id])

  useEffect(() => {
       const fetchSummary = async () => {
        if ((!post?.title && !post?.body) || !post?.id)
          return

        setLoadingSummary(true)
        console.log("getting llm summary")

        try {
          const engine = await getEngine()

          const prompt = `
          Summarize this social media post in 1-3 sentences,
          do not repeat title or body
          
          Title: ${post.title}
          Body: ${post.body}`
        

        const response = await engine.chat.completions.create({
                messages: [{
                    role: "user",
                    content: prompt,
                }
              ],
            })

        const text = response.choices[0].message.content
        setLoadingSummary(false)
        setSummary(text)

        } catch (e) {
          console.error(e)
          setSummary("Failed to generate summary.")
        }

        
      
      
    }

    fetchSummary()
  }, [post?.id])

  return (
    <div className="flex flex-col w-full pt-16">
      <div onClick={() => navigate(-1)} className="fixed text-2xl p-8 top-16 left-4 rounded-full hover:cursor-pointer hover:bg-gray-700">
        &#x2b05;
      </div>
      {/* <div>Thread Sample: </div> */}
      {thread.map((tPost, idx) => (
        <div className="flex flex-col items-center text-center">
          <PostCard post={tPost} userID={userID} setDeleteMessage={setDeleteMessage}></PostCard>

          {idx !== thread.length - 1 && (
            <>
              <div>|</div>
              <div>|</div>
              <div>|</div>
              <div>|</div>
            </>
          )}

          {idx == thread.length - 1 && (
              <div className="pb-4"></div>
          )}

        </div>
      ))}
      {/* <div className="text-center text-2xl">Main Post: </div>
      <PostCard post={post} userID={userID}>
      </PostCard> */}
      <div className="text-center text-2xl p-2">Replies</div>
        {replies.map((reply, id) => (
          <div className="flex flex-col items-center text-center">
            <PostCard post={reply} userID={userID} setDeleteMessage={setDeleteMessage}>
            </PostCard>
          </div>
        ))}
        <div className="text-2xl fixed top-30 right-2 bg-gradient-to-r from-pink-500 via-yellow-400 via-green-400 to-blue-500 bg-clip-text text-transparent font-bold">
          LLM Summary:
        </div>
        <div className="fixed top-40 right-4 p-2 w-40 break-words whitespace-normal">
          {loadingSummary ? <div>Loading... (This is a client side task that takes ~1-2 minutes)</div> : <div>{summary}</div>}
        </div>
    </div>
  )

}

const SignUpPage = ({setUsername, setUserID, setLoggedIn}) => {
  const [userN, setUserN] = useState("")
  const [PW, setPW] = useState("")
  const navigate = useNavigate()

  const handleSignup = async () => {
      const { data, error } = await supabase.auth.signUp({
      email: userN,
      password: PW
    })

    if (error) {
      console.log(error)
      return
    }

    const user = data?.user

    if (user) {
      setUserID(user.id)
      setLoggedIn(true)
    }

    navigate("/")

  }

  return (
    <div>
      <div onClick={() => navigate(-1)} className="fixed text-2xl p-8 top-16 left-4 rounded-full hover:cursor-pointer hover:bg-gray-700">
        &#x2b05;
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="text-gray-200 text-5xl m-4">Sign Up</div>
        <div className="text-gray-200 text-2xl m-2">Email: </div>
        <input type="text" className="bg-gray-200 text-gray-800 rounded-md p-2 m-2" onChange={(e) => setUserN(e.target.value)}></input>
        <div className="text-gray-200 text-2xl m-2">Password: </div>
        <input type="password" className="bg-gray-200 text-gray-800 rounded-md p-2 m-2" onChange={(e) => setPW(e.target.value)}></input><div></div>
        <div className="m-4 bg-blue-400 hover:bg-gray-700 hover:cursor-pointer rounded-2xl w-24 text-center p-4" onClick={() => handleSignup()}>Sign Up</div>
      </div>
    </div>
  )
}

const LoginPage = ({setUsername, setUserID, setLoggedIn}) => {
  const [userN, setUserN] = useState("")
  const [PW, setPW] = useState("")
  const navigate = useNavigate()
  const [resetMessage, setResetMessage] = useState("")
  const [showResetMessage, setShowResetMessage] = useState(false)
  const [credentialsMessage, setCredentialsMessage] = useState("")

  // const redirectTo =
    // import.meta.env.MODE === "development"
    //   ? "http://localhost:5173/reset-password"
    //   : "https://funny-crostata-727b39.netlify.app/reset-password"

  const redirectTo = "http://localhost:5173/reset-password"

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userN,
      password: PW
    })

    if (error) { 
      console.log(error)
      setCredentialsMessage("Wrong Email or Password")
      return
    }
  
    const user = data?.user
    if (!user) return


  setUserID(user.id)
  setLoggedIn(true)


  navigate("/")

  }

  const handleGoogleLogin = async () => {
    const { error } = supabase.auth.signInWithOAuth({
      provider : "google",   
    })

    if (error)
      console.log(error)
  }

  const handleForgotPassword = async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(userN, {
      redirectTo: redirectTo
    })

    setShowResetMessage(true)

    if (error) {
      setResetMessage(error.message)
    } else {
      setResetMessage("Email Successful, go check " + userN + " For Password Reset")
    }


  }

  return (
    <div>
      <div onClick={() => navigate(-1)} className="fixed text-2xl p-8 top-16 left-4 rounded-full hover:cursor-pointer hover:bg-gray-700">
        &#x2b05;
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="text-gray-200 text-5xl m-4">Login</div>
        <div className="text-gray-200 text-2xl m-2">Email: </div>
        <input type="text" className="bg-gray-200 text-gray-800 rounded-md p-2 m-2" onChange={(e) => setUserN(e.target.value)}></input>
        <div className="text-gray-200 text-2xl m-2">Password: </div>
        <input type="password" className="bg-gray-200 text-gray-800 rounded-md p-2 m-2" onChange={(e) => setPW(e.target.value)}></input><div></div>
        <div className="m-4 bg-blue-400 hover:bg-gray-700 hover:cursor-pointer rounded-2xl w-24 text-center p-4" onClick={() => handleLogin()}>Login</div>
        <div className="m-2 text-red-500">{credentialsMessage}</div>
        {/* <div className="text-2xl m-2">Or</div>
        <div className="m-4 bg-red-500 hover:bg-gray-700 hover:cursor-pointer rounded-2xl w-24 text-center p-4" onClick={() => handleGoogleLogin()}>Login with Google</div> */}
        {userN != "" && (<><div className="text-2xl m-2">Forgot Password?</div>
        <div className="m-4 bg-green-400 text-gray-950 hover:bg-blue-900 hover:cursor-pointer rounded-2xl w-64 text-center p-4 whitespace-normal break-words" onClick={() => handleForgotPassword()}>Reset Password for {userN}</div>
        </>)}
        {resetMessage != "" && showResetMessage && 
        <div className="fixed bottom-0 right-0 p-4 bg-green-800 text-gray-100">
          <div className="absolute text-2xl top-0 right-0 p-2 hover:cursor-pointer hover:bg-gray-400" onClick={() => setShowResetMessage(false)}>
            X
          </div>
          <div className='p-6'>
          {resetMessage}
          </div>
        </div>}
      </div>
    </div>
  )
}


const handleLikeSubmit = async (postID, userID, likes, setLikes) => {
  console.log("postID: ", postID)
  console.log("userID: ", userID)

  const { data, error } = await supabase
    .from("birdLikesTable")
    .select("id")
    .eq("postID", postID)
    .eq("userID", userID)
    .maybeSingle()

    if (data) {
      const { error: deleteError } = await supabase
        .from("birdLikesTable")
        .delete()
        .eq("id", data.id)

      if (deleteError) {
        console.log(deleteError)
        return
      }

      await supabase
        .from("birdPosts")
        .update({ likes: likes - 1 })
        .eq("id", postID)
      
        setLikes((prev) => prev - 1)
      
    } else {
      const {error : insertError } = await supabase
        .from("birdLikesTable")
        .insert([
          {
          postID: postID,
          userID: userID
        },
      ])

      if (insertError) {
        console.error(insertError)
        return
      }

    await supabase
      .from("birdPosts")
      .update({ likes: likes + 1 })
      .eq("id", postID)


      setLikes((prev) => prev + 1)
    }
      

}

const handleSignOut = async (setUserID, setUsername, setLoggedIn) => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log("Sign out error:", error)
    return
  }

  localStorage.removeItem("userID")

  setUserID("")
  setUsername("")
  setLoggedIn(false)
}


const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

    useEffect(() => {
      const initRecovery = async () => {
        await supabase.auth.getSession()
      }

      initRecovery()
    }, [])

  useEffect(() => {
    setTimeout(() => {
      window.history.replaceState({}, document.title, "/reset-password")
    }, 300)
  }, [])

  const handleUpdatePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage("Password updated successfully")

      setTimeout(() => {
        navigate("/login")
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-200">
      <h1 className="text-2xl m-4">Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        className="p-2 m-2 text-black"
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button
        className="bg-blue-500 p-2 m-2 rounded"
        onClick={handleUpdatePassword}
      >
        Update Password
      </button>

      {message && <div className="m-2">{message}</div>}
    </div>
  )
}


const handleDelete = async (post, setDeleteMessage) => {
    
  const { data, error } = await supabase
    .from("birdPosts")
    .delete()
    .eq("id", post.id)

    if (error) {
      console.log(error)
      return
    }

    console.log("Deleted:", data)
    setDeleteMessage("Post " + post.id + " has been deleted")

}




export default App



