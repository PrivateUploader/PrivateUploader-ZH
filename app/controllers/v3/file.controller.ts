import { Controller, Get, Param, QueryParam, Res } from "routing-controllers"
import { Service } from "typedi"
import { Auth } from "@app/lib/auth"
import { User } from "@app/models/user.model"
import Errors from "@app/lib/errors"
import { GalleryService } from "@app/services/gallery.service"
import { CacheService } from "@app/services/cache.service"
import { Upload } from "@app/models/upload.model"
import fs from "fs"
import { Response } from "express"
import { promisify } from "util"
import path from "path"

@Service()
@Controller("/i/")
export class FileControllerV3 {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly cacheService: CacheService
  ) {}

  @Get(":attachment")
  async getFile(
    @Auth("uploads.view", false) user: User,
    @Param("attachment") attachment: string,
    @QueryParam("force") force: boolean,
    @Res() res: Response
  ) {
    const upload = await Upload.findOne({
      where: {
        attachment
      }
    })
    if (config.release === "dev") {
      try {
        await fs.accessSync(
          config.storage + "/" + attachment,
          fs.constants.F_OK
        )
      } catch {
        res.redirect("https://i.troplo.com/i/" + attachment)
        return res
      }
    }
    if (!upload) {
      throw Errors.NOT_FOUND
    }
    //Acropalypse temporary patch
    if (
      upload.userId === 1 &&
      upload.name.startsWith("Screenshot_2022") &&
      user?.id !== 1 &&
      config.officialInstance
    ) {
      const file = path.resolve(appRoot + "/assets/AuthRequired.png")
      await promisify<string, void>(res.sendFile.bind(res))(file)
      return res
    }
    if (force) {
      res.download(config.storage + "/" + attachment, upload.originalFilename)
      return res
    }
    if (
      upload.type === "image" ||
      upload.type === "video" ||
      upload.type === "audio"
    ) {
      const file = path.resolve(config.storage + "/" + upload.attachment)
      await promisify<string, void>(res.sendFile.bind(res))(file)
      return res
    } else {
      res.download(
        config.storage + "/" + upload.attachment,
        upload.originalFilename
      )
      return res
    }
  }
}
