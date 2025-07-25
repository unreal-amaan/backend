   const authMiddleware = (req, res, next) => {
       const token = req.cookies.token;
       console.log("Token from cookies:", token); 
       if (!token) {
           console.log("⚠️ Token missing from request cookies");
           return res.status(401).json({ message: 'Not authorized' });
       }
       try {
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
           req.userId = decoded.id; // Set userId here
           console.log("Decoded user ID:", req.userId); // Debug log
           next();
       } catch (error) {
           console.log("⚠️ Invalid token", error.message);
           res.status(401).json({ message: 'Invalid token' });
       }
   };

   module.exports = authMiddleware;