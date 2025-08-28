import fs from "fs";
import jwt from "jsonwebtoken";

export const unlink = (path) => {
    fs.existsSync(path) && fs.unlinkSync(path);
}

export const getAccessTokenByUserId = (id, expiresIn = '7d') => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn});
}