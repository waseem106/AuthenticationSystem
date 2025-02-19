
const roleBaseAccess= (role)=>
{
    return (req,res,next)=>{
            if(!role.includes (req.user.role))
            {
                return res.status(404).json({accessDenied:"Access Denied"})
            }
            next()
    }

}


export default roleBaseAccess