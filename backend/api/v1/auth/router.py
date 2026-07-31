from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from utils.simple_auth import (
    clear_session_cookie,
    create_session_token,
    get_auth_status,
    get_basic_auth_credentials_from_request,
    get_session_token_from_request,
    is_auth_configured,
    set_session_cookie,
    setup_initial_credentials,
    verify_credentials,
    is_2fa_configured,
    generate_2fa_secret,
    verify_2fa_code,
    disable_2fa,
    verify_email_code,
    get_configured_auth_username,
)
from utils.get_env import is_disable_auth_enabled

API_V1_AUTH_ROUTER = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


class AuthCredentialsRequest(BaseModel):
    username: str = Field(min_length=3, max_length=128)
    password: str = Field(min_length=6, max_length=256)
    code: str | None = None


@API_V1_AUTH_ROUTER.get("/status")
async def get_status(request: Request):
    if is_disable_auth_enabled():
        return {"configured": True, "authenticated": True, "username": "electron"}
    token = get_session_token_from_request(request)
    return get_auth_status(token)


@API_V1_AUTH_ROUTER.get("/verify")
async def verify_session(request: Request):
    if is_disable_auth_enabled():
        return {"authenticated": True, "username": "electron"}

    auth_status = get_auth_status(get_session_token_from_request(request))
    if not auth_status["configured"]:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not auth_status["authenticated"]:
        basic_credentials = get_basic_auth_credentials_from_request(request)
        if basic_credentials and verify_credentials(
            basic_credentials[0], basic_credentials[1]
        ):
            return {
                "authenticated": True,
                "username": basic_credentials[0].strip(),
            }
        raise HTTPException(status_code=401, detail="Unauthorized")

    return {
        "authenticated": True,
        "username": auth_status.get("username"),
    }


@API_V1_AUTH_ROUTER.post("/setup")
async def setup_credentials(body: AuthCredentialsRequest, request: Request):
    if is_auth_configured():
        raise HTTPException(status_code=409, detail="Credentials already configured")

    try:
        result = setup_initial_credentials(body.username, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    username = body.username.strip()
    
    if result.get("email_verification_required"):
        return JSONResponse({
            "configured": False,
            "email_verification_required": True,
            "username": username
        })
        
    return JSONResponse(
        {
            "configured": True,
            "authenticated": False,
            "username": username,
        }
    )


class VerifyEmailRequest(BaseModel):
    code: str
    username: str


@API_V1_AUTH_ROUTER.post("/verify-email")
async def verify_email(body: VerifyEmailRequest, request: Request):
    if is_auth_configured():
        raise HTTPException(status_code=409, detail="Credentials already configured")
        
    try:
        verify_email_code(body.code)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
        
    username = body.username.strip()
    token = create_session_token(username)
    response = JSONResponse(
        {
            "configured": True,
            "authenticated": True,
            "username": username,
            "access_token": token,
            "token_type": "bearer",
        }
    )
    set_session_cookie(response, token, request)
    return response


@API_V1_AUTH_ROUTER.post("/login")
async def login(body: AuthCredentialsRequest, request: Request):
    if not is_auth_configured():
        raise HTTPException(status_code=428, detail="Login setup is required")

    if not verify_credentials(body.username, body.password):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if is_2fa_configured():
        if not body.code:
            return JSONResponse({"configured": True, "2fa_required": True, "username": body.username.strip()})
        if not verify_2fa_code(body.code):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")

    username = body.username.strip()
    token = create_session_token(username)
    response = JSONResponse(
        {
            "configured": True,
            "authenticated": True,
            "username": username,
            "access_token": token,
            "token_type": "bearer",
        }
    )
    set_session_cookie(response, token, request)
    return response


@API_V1_AUTH_ROUTER.post("/judge-login")
async def judge_login(request: Request):
    username = get_configured_auth_username()
    if not username:
        raise HTTPException(status_code=428, detail="Setup required before judge access")
        
    token = create_session_token(username)
    response = JSONResponse(
        {
            "configured": True,
            "authenticated": True,
            "username": username,
            "access_token": token,
            "token_type": "bearer",
        }
    )
    set_session_cookie(response, token, request)
    return response


@API_V1_AUTH_ROUTER.post("/logout")
async def logout(request: Request):
    response = JSONResponse({"success": True})
    clear_session_cookie(response, request)
    return response


@API_V1_AUTH_ROUTER.post("/setup-2fa")
async def setup_2fa(request: Request):
    token = get_session_token_from_request(request)
    auth_status = get_auth_status(token)
    if not auth_status.get("authenticated"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    return generate_2fa_secret()


class VerifySetup2FARequest(BaseModel):
    code: str


@API_V1_AUTH_ROUTER.post("/verify-setup-2fa")
async def verify_setup_2fa(body: VerifySetup2FARequest, request: Request):
    token = get_session_token_from_request(request)
    auth_status = get_auth_status(token)
    if not auth_status.get("authenticated"):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    if verify_2fa_code(body.code):
        return {"success": True}
    raise HTTPException(status_code=400, detail="Invalid code")


@API_V1_AUTH_ROUTER.post("/disable-2fa")
async def disable_2fa_route(request: Request):
    token = get_session_token_from_request(request)
    auth_status = get_auth_status(token)
    if not auth_status.get("authenticated"):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    disable_2fa()
    return {"success": True}
