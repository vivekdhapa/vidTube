class ApiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errors=[], //since can be many errors
        stack="" //usually in string format
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors;

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export { ApiError  }