import {Bucket, Storage} from "@google-cloud/storage";
import UserModel from "./endpoints/User/UserModel";
import bcrypt from "bcryptjs";
import process from "process";
import paymentController from "./endpoints/Payment/PaymentController";
import TicketModel from "./endpoints/Ticket/TicketModel";


export const createDefaultAdmin = async () => {
    const adminUser = await UserModel.findOne({email: 'admin@mail.de'});
    if (!adminUser) {
        const hashedPassword = await bcrypt.hash('admin', 10);
        await UserModel.create({
            username: 'default-admin',
            fist_name: 'default',
            last_name: 'admin',
            email: 'admin@mail.de',
            password: hashedPassword,
            isAdmin: true,
            isOrganizer: true,
            isVerified: true,
            stripe_id: 'not-set'
        }).then(() => {
            console.log('Admin user created');
        }).catch((error) => {
            console.error('Error creating admin user:', error);
        });
    } else {
        console.log('Admin user already exists');
    }
}

export const createDefaultOrganizer = async () => {
    const organizerUser = await UserModel.findOne({email: 'organizer@mail.de'});
    if (!organizerUser) {
        const hashedPassword = await bcrypt.hash('organizer', 10);
        await UserModel.create({
            username: 'default-organizer',
            fist_name: 'default',
            last_name: 'organizer',
            email: 'organizer@mail.de',
            password: hashedPassword,
            isAdmin: false,
            isOrganizer: true,
            isVerified: true,
            stripe_id: 'not-set'
        }).then(() => {
            console.log('Organizer user created');
        }).catch((error) => {
            console.error('Error creating organizer user:', error);
        });
    } else {
        console.log('Organizer user already exists');
    }
}

export const createDefaultUser = async () => {
    UserModel.findOne({email: 'user@mail.de'}).then(async (user) => {
        if (!user) {
            const hashedPassword = bcrypt.hashSync('user', 10);
            //const data = await paymentController.createCustomer('user@mail.de', 'default', 'user', );
            UserModel.create({
                username: 'default-user',
                fist_name: 'default',
                last_name: 'user',
                stripe_id: 'cus_O117kBvHkngvcG',
                email: 'user@mail.de',
                password: hashedPassword,
                isAdmin: false,
                isOrganizer: false,
                isVerified: true,
            }).then(() => {
                console.log('User created');
            }).catch((error) => {
                console.error('Error creating user:', error);
            });
        } else {
            console.log('User already exists');
        }
    }).catch((error) => {
        console.error('Error creating user:', error);
    });
}
export const createDefaultTicket = async () => {
    TicketModel.findOne({uuid: 'abcdefghi'}).then(async (ticket) => {
        if (!ticket) {
            TicketModel.create({
                name: 'The Weekend - World Tourney',
                uuid: 'abcdefghi',
                event_id: 'default',
                owner_id: 'default',
                price: 19.99,
                date: "19.05.2023",
                location_id: 'default',
                isUsed: false
            }).then(() => {
                console.log('Ticket created');
            }).catch((error) => {
                console.error('Error creating ticket:', error);
            });
        } else {
            console.log('Ticket already exists');
        }
    }).catch((error) => {
        console.error('Error creating ticket:', error);
    });
}
const setupGoogleStorageConnection = (): Bucket => {
    try {
        const tst = JSON.parse(process.env.GC_KEY_FILE || "");
        // @ts-ignore
        const gc = new Storage({
            projectId: "rare-style-385113",
            credentials: {
                type: tst.type,
                // @ts-ignore
                project_id: tst.project_id,
                private_key_id: tst.private_key_id,
                private_key:`-----BEGIN PRIVATE KEY-----\n${tst.private_key}\n-----END PRIVATE KEY-----\n`,
                client_email: tst.client_email,
                client_id: tst.client_id,
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: tst.client_x509_cert_url,
            },

        });

        return gc.bucket("bht-mmt-bucket");


    } catch (error) {
        console.error('Error connecting to Google Cloud Storage:', error);
        throw error;
    }

}
async function makeBucketPublic(gcBucket: any) {
    gcBucket.makePublic().then(() => {
        console.log(`Bucket ${gcBucket.name} is now public.`);
    }).catch((error: any) => {
        console.error(`Failed to make bucket ${gcBucket.name} public:`, error);
    })
}


export const uploadImage = (image: string, imageName: string, imageArray: object[]) => new Promise((resolve, reject) => {
    if (!imageArray) {
        return reject("No image provided");
    }

    interface ImageObject {
        data: string;
        name: string;
    }

    const imageUrls: string[] = [];

    const uploadPromises = imageArray.map((imgobj) => {
        return new Promise<void>((res, rej) => {
            const myimage: ImageObject = imgobj as ImageObject;
            const base64EncodedImageString = myimage.data.split(';base64,').pop();
            if (!base64EncodedImageString) {
                return rej("No base64 encoded image string provided");
            }
            const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
            const mmtbucket = setupGoogleStorageConnection();
            makeBucketPublic(mmtbucket);
            const blob = mmtbucket.file(myimage.name);
            const blobStream = blob.createWriteStream({
                resumable: false,
            });
            blobStream.on('error', rej);
            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${mmtbucket.name}/${blob.name}`;
                imageUrls.push(publicUrl);
                res();
            });
            blobStream.end(imageBuffer);
        });
    });

    Promise.all(uploadPromises)
        .then(() => resolve(imageUrls))
        .catch((error) => reject(error));
});


/*const base64EncodedImageString = image.split(';base64,').pop();

if (!base64EncodedImageString) {
    return reject("No base64 encoded image string provided");
}
const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
const mmtbucket = setupGoogleStorageConnection();
makeBucketPublic(mmtbucket);
const blob = mmtbucket.file(imageName);
const blobStream = blob.createWriteStream({
    resumable: false,
});
blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${mmtbucket.name}/${blob.name}`;
    return resolve(publicUrl);
});
blobStream.end(imageBuffer);*/
/*
app.post("/api/upload", (req: Request, res: Response) => {

    console.log(req.body);
    const {image , imageName} = req.body;
    const base64EncodedImageString = image.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
    const blob = mmtbucket.file(imageName);
    const blobStream = blob.createWriteStream({
        resumable: false,
    });
    blobStream.on('finish', () => {
        const publicUrl = `https://storage.cloud.google.com/${mmtbucket.name}/${blob.name}`;
        //https://storage.cloud.google.com/bht-mmt-bucket/test-image.jpg
        res.status(200).send({ publicUrl });
    });
    blobStream.end(imageBuffer);
})
*/