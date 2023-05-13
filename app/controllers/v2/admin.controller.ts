import { Response, NextFunction } from "express"
import { Service } from "typedi"
import auth from "@app/lib/auth"
import { RequestAuth } from "@app/types/express"
import Errors from "@app/lib/errors"
import Router from "express-promise-router"
import { AdminService } from "@app/services/admin.service"
import { CacheService } from "@app/services/cache.service"
import { User } from "@app/models/user.model"
import { UserUtilsService } from "@app/services/userUtils.service"
import { CoreService } from "@app/services/core.service"
import { CacheType } from "@app/enums/admin/CacheType"

@Service()
export class AdminController {
  router: any

  constructor(
    private readonly adminService: AdminService,
    private readonly cacheService: CacheService,
    private readonly userUtilsService: UserUtilsService,
    private readonly coreService: CoreService
  ) {
    this.configureRouter()
  }

  private configureRouter(): void {
    this.router = Router()

    // MODERATOR ROUTES ** LOW LEVEL
    this.router.all(
      "*",
      auth("admin"),
      async (req: RequestAuth, res: Response, next: NextFunction) => {
        if (!req.user.administrator && !req.user.moderator) {
          throw Errors.ADMIN_ONLY
        }
        next()
      }
    )

    /**
     * @swagger
     *
     * /api/v2/admin:
     *   get:
     *     description: Return statistics about the running TPU instance.
     *     tags:
     *       - AdminService
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: OK
     *     parameters:
     *         - in: header
     *           name: Authorization
     *           schema:
     *             type: string
     *             format: TPU-KEY
     *           required: true
     */
    this.router.get(
      "/dashboard",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const stats = await this.adminService.getStats()
        res.json(stats)
      }
    )

    /**
     * @swagger
     *
     * /api/v2/admin/cache/:id:
     *   delete:
     *     description: Purge Redis cache for TPU instance.
     *     tags:
     *       - AdminService
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: OK
     *     parameters:
     *         - in: header
     *           name: Authorization
     *           schema:
     *             type: string
     *             format: TPU-KEY
     *           required: true
     */
    this.router.delete(
      ["/cache/:id", "/cache/:id/:uid"],
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        if (req.params.uid) {
          res.sendStatus(204)
          await this.adminService.purgeUserCache(parseInt(req.params.uid))
        } else {
          res.sendStatus(204)
          await this.adminService.purgeCache(
            parseInt(req.params.id) as CacheType
          )
        }
      }
    )

    this.router.get(
      "/users",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const users = await this.adminService.getUsers()
        res.json(users)
      }
    )

    this.router.get(
      "/invites",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const invites = await this.adminService.getInvites()
        res.json(invites)
      }
    )

    this.router.patch(
      "/invites/:inviteKey",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const invite = await this.adminService.actOnInvite(
          req.params.inviteKey,
          req.body.type
        )
        if (invite) {
          res.sendStatus(204)
          await this.cacheService.purgeInvite(req.params.inviteKey)
          if (req.body.type === "accepted") {
            await this.adminService.sendEmail(
              {
                body: {
                  intro: `Your friend ${invite.user.username} has invited you to join TPU.`,
                  action: [
                    {
                      instructions: `TPU is a free invite-only image and file hosting service.`,
                      button: {
                        color: "#0190ea", // Optional action button color
                        text: "Create your account",
                        link:
                          config.hostnameWithProtocol +
                          "/invite/" +
                          invite.inviteKey
                      }
                    },
                    {
                      instructions:
                        "Want to learn more about the advantages of TPU?",
                      button: {
                        color: "#0190ea", // Optional action button color
                        text: "Learn more",
                        link: "https://images.flowinity.com"
                      }
                    }
                  ],
                  outro:
                    "If you do not intend to create an account, you can ignore this email."
                }
              },
              invite.email,
              `Your friend ${invite.user.username} has invited you to join TPU`
            )
          }
          await this.adminService.sendEmail(
            {
              body: {
                intro: `Your invite request has been ${req.body.type}.`,
                action: [
                  {
                    instructions: `The invite request to your friend ${invite.email} has been ${req.body.type}.`,
                    button: {
                      color: "#0190ea", // Optional action button color
                      text: "Go to TPU",
                      link: config.hostnameWithProtocol
                    }
                  }
                ]
              }
            },
            invite.user.email,
            `Your TPU invite request has been ${req.body.type}.`
          )
        } else {
          throw Errors.INVITE_NOT_FOUND
        }
      }
    )

    this.router.get(
      "/feedback",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const feedback = await this.adminService.getFeedback()
        res.json(feedback)
      }
    )

    this.router.get(
      "/csv/uploads",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const csv = await this.adminService.exportCSVUploads()
        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=uploads.csv")
        res.send(csv)
      }
    )

    this.router.patch("/ban", async (req: RequestAuth, res: Response) => {
      if (!req.body.id) throw Errors.INVALID_PARAMETERS
      await this.adminService.updateBanned(req.body.id, req.body.banned)
      res.sendStatus(204)
    })

    this.router.post("/badge", async (req: RequestAuth, res: Response) => {
      await this.adminService.createBadge(
        req.body.name,
        req.body.description,
        req.body.icon,
        req.body.color,
        req.body.tooltip,
        req.body.image
      )
      res.sendStatus(204)
    })

    this.router.post(
      "/badge/users",
      async (req: RequestAuth, res: Response) => {
        if (!req.body.id) throw Errors.INVALID_PARAMETERS
        await this.adminService.addUsersToBadge(req.body.userIds, req.body.id)
        res.sendStatus(204)
      }
    )

    this.router.put("/badge", async (req: RequestAuth, res: Response) => {
      await this.adminService.updateBadge(req.body)
      res.sendStatus(204)
    })

    this.router.delete(
      "/badge/:id",
      async (req: RequestAuth, res: Response) => {
        await this.adminService.deleteBadge(parseInt(<string>req.params.id))
        res.sendStatus(204)
      }
    )

    this.router.get("/badges", async (req: RequestAuth, res: Response) => {
      res.json(await this.adminService.getBadges())
    })

    this.router.post(
      "/badge/users/delete",
      async (req: RequestAuth, res: Response) => {
        await this.adminService.removeUsersFromBadge(
          req.body.userIds,
          req.body.id
        )
        res.sendStatus(204)
      }
    )

    // ADMIN ROUTES ** HIGH LEVEL
    this.router.all(
      "*",
      auth("admin"),
      async (req: RequestAuth, res: Response, next: any) => {
        if (!req.user.administrator) {
          throw Errors.ADMIN_ONLY
        }
        next()
      }
    )

    this.router.get(
      "/autoCollects",
      async (req: RequestAuth, res: Response) => {
        res.json(await this.adminService.getAutoCollectRules())
      }
    )

    this.router.post(
      "/autoCollects",
      async (req: RequestAuth, res: Response) => {}
    )

    this.router.post(
      "/announcement",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const announcement = await this.adminService.createAnnouncement(
          req.body.content,
          req.user.id
        )
        res.json(announcement)
        await this.cacheService.refreshState()
      }
    )

    this.router.post(
      "/notification",
      auth("*"),
      async (req: RequestAuth, res: Response, next: NextFunction) => {
        try {
          if (req.body.username === "allOfThem") {
            const users = await User.findAll()
            for (const user of users) {
              await this.userUtilsService.createNotification(
                user.id,
                req.body.content,
                req.body.link
              )
            }
            res.sendStatus(204)
            return
          }
          const user = await User.findOne({
            where: {
              username: req.body.username
            }
          })

          if (!user) {
            throw Errors.USER_NOT_FOUND
          }

          await this.userUtilsService.createNotification(
            user.id,
            req.body.content,
            req.body.link
          )
          res.sendStatus(204)
        } catch (e) {
          next(e)
        }
      }
    )

    this.router.get(
      "/experiments/:id",
      auth("*"),
      async (req: RequestAuth, res: Response, next: NextFunction) => {
        try {
          const user = await User.findOne({
            where: {
              id: req.params.id
            }
          })
          if (!user) throw Errors.USER_NOT_FOUND
          const dev = req.user ? user.administrator || user.moderator : false
          const experiment = await this.coreService.getUserExperiments(
            parseInt(req.params.id),
            dev
          )
          res.json({
            ...experiment,
            defaults: this.coreService.getExperiments(dev)
          })
        } catch (e) {
          next(e)
        }
      }
    )

    this.router.post(
      "/experiments/:id",
      auth("*"),
      async (req: RequestAuth, res: Response, next: NextFunction) => {
        try {
          const user = await User.findOne({
            where: {
              id: req.params.id
            }
          })
          if (!user) throw Errors.USER_NOT_FOUND
          const dev = req.user ? user.administrator || user.moderator : false
          const currentExperiments = await this.coreService.getUserExperiments(
            parseInt(req.params.id),
            dev
          )
          const experiments = await this.adminService.createExperimentOverrides(
            // @ts-ignore
            currentExperiments,
            req.body,
            user.id,
            dev
          )
          res.json(experiments)
        } catch (e) {
          next(e)
        }
      }
    )

    this.router.get(
      "/services",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const services = await this.adminService.getServices()
        res.json(services)
      }
    )

    this.router.post(
      "/restart",
      auth("admin.ci"),
      async (req: RequestAuth, res: Response) => {
        if (!process.send) throw Errors.UNKNOWN
        console.log("Restarting TPU")
        process.send("TPU_RESTART")
        res.sendStatus(204)
      }
    )

    this.router.patch("/gold", async (req: RequestAuth, res: Response) => {
      if (!req.body.id || !req.body.planId) throw Errors.INVALID_PARAMETERS
      await this.adminService.updatePlanId(req.body.id, req.body.planId)
      res.sendStatus(204)
    })

    this.router.all(
      "/scripts/*",
      auth("*"),
      async (req: RequestAuth, res: Response, next: NextFunction) => {
        if (req.user.id !== 1) {
          throw Errors.ADMIN_ONLY
        } else {
          next()
        }
      }
    )

    // --SCRIPTS--
    this.router.post(
      "/scripts/groupOwners",
      async (req: RequestAuth, res: Response) => {
        await this.adminService.scriptColubrinaGroupOwner()
        res.sendStatus(204)
      }
    )

    this.router.post(
      "/scripts/dmOwners",
      async (req: RequestAuth, res: Response) => {
        await this.adminService.scriptColubrinaDMOwners()
        res.sendStatus(204)
      }
    )

    this.router.post(
      "/scripts/dmMerge",
      async (req: RequestAuth, res: Response) => {
        await this.adminService.scriptColubrinaDMMerge()
        res.sendStatus(204)
      }
    )

    this.router.post(
      "/scripts/dmIntents",
      async (req: RequestAuth, res: Response) => {
        await this.adminService.scriptColubrinaDMIntents()
        res.sendStatus(204)
      }
    )

    this.router.all(
      "*",
      auth("*"),
      async (req: RequestAuth, res: Response, next: NextFunction) => {
        if (config.release !== "dev") {
          throw Errors.ADMIN_ONLY
        } else {
          next()
        }
      }
    )

    this.router.patch(
      "/dev/friendAccept",
      async (req: Request, res: Response) => {
        await this.adminService.devAcceptFriends()
        res.sendStatus(204)
      }
    )

    this.router.post("/dev/email", async (req: RequestAuth, res: Response) => {
      if (!req.body.email || !req.body.to || !req.body.subject)
        throw Errors.INVALID_PARAMETERS
      await this.adminService.sendEmail(
        req.body.email,
        req.body.to,
        req.body.subject
      )
      res.sendStatus(204)
    })

    /*    this.router.get(
      "/online",
      auth("*"),
      async (req: RequestAuth, res: Response) => {
        const online = await this.adminService.getConnectedUsers()
        res.json(online)
      }
    )*/
  }
}