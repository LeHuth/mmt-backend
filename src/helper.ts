import {Bucket, Storage} from "@google-cloud/storage";
import UserModel from "./endpoints/User/UserModel";
import TagModel from "./endpoints/Tags/TagModel";
import bcrypt from "bcryptjs";
import process from "process";
import jwt from "jsonwebtoken";
import EventLocationModel, {IAddress} from "./endpoints/EventLocation/EventLocationModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tags from "../tags.json";
import categories from "../categories.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import EventModel, {IHappening} from "./endpoints/Event/EventModel";
import CategoryModel from "./endpoints/Category/CategoryModel";
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

export const createDefaultLocation = async () => {
    const location = await EventLocationModel.findOne({name: 'BHT'});
    if (!location) {
        const address: IAddress = {
            street: 'Luxemburger Straße',
            houseNumber: '10',
            city: 'Berlin',
            zipCode: '13353',
            country: 'Deutschland',
        }
        await EventLocationModel.create({
            name: 'BHT',
            address: address,
            description: 'Default location',
        }).then(() => {
            console.log('Location created');
        }).catch((error) => {
            console.error('Error creating location:', error);
        });
    } else {
        console.log('Location already exists');
    }
    if (!await EventLocationModel.findOne({name: 'Mercedes-Benz Arena'})) {
        const address: IAddress = {
            street: 'Mercedes-Platz',
            houseNumber: '1',
            city: 'Berlin',
            zipCode: '10243',
            country: 'Deutschland',
        }
        await EventLocationModel.create({
            name: 'Mercedes-Benz Arena',
            address: address,
            description: 'The Mercedes-Benz Arena is a multipurpose indoor arena in the Friedrichshain neighborhood of Berlin, Germany, which opened in 2008.',
        }).then(() => {
            console.log('Mercedes Benz created');
        }).catch((error) => {
            console.error('Error creating location:', error);
        });
    } else {
        console.log('Location already exists');
    }
}

export const createDefaultTags = async () => {
    const tagsFromDb = await TagModel.find({});
    if (tagsFromDb.length === 0) {
        for (const tag of tags.tags) {
            const newTag = new TagModel({
                _id: uuidv4(),
                name: tag.name,
            });
            await newTag.save();
        }
    } else {
        console.log('Tags already exist');
    }
}

export const createDefaultCategories = async () => {
    const categoriesFromDb = await CategoryModel.find({});
    if (categoriesFromDb.length === 0) {
        for (const category of categories.categories) {
            const newCategory = new CategoryModel({
                _id: uuidv4(),
                name: category.name,
            });
            await newCategory.save();
        }
    }
}

export const createDefaultEvent = async () => {
    const event = await EventModel.findOne({name: 'Default Event'});
    if (!event) {
        const organizer = await UserModel.findOne({email: 'organizer@mail.de'});
        const location = await EventLocationModel.findOne({name: 'BHT'});
        const tags = await TagModel.find({url_param: 'electronic'});
        const categories = await CategoryModel.find({});
        const happening: IHappening = {
            date: new Date(),
            time: '12:00',
            place: location?._id || ''
        }
        if (organizer && location && tags) {
            await EventModel.create({
                _id: uuidv4(),
                name: 'Default Event',
                quip: 'Amazing default event',
                description: 'Default Event',
                organizer: organizer._id,
                happenings: [happening],
                tags: [tags[0]._id],
                images: ['https://cdn.midjourney.com/9da77a74-e3dc-43f9-b1b8-9b2d9d582b69/0_0.png', 'https://cdn.midjourney.com/6467560c-f0b2-424f-b522-79a881c2f9fc/0_0.png', 'https://cdn.midjourney.com/6084addc-0f57-4c7b-8e4e-f13090f14638/0_0.png'],
                category: categories[0]._id,
                price: 30,
                available: 75,
            }).then(() => {
                console.log('Event created');
                CategoryModel.updateOne({_id: categories[0]._id}, {$inc: {amount: 1}}).then(() => {
                    console.log('Category updated');
                }).catch((error) => {
                    console.error('Error updating category:', error);
                });
            }).catch((error) => {
                console.error('Error creating event:', error);
            });
            await EventModel.create({
                _id: uuidv4(),
                name: 'Alien Architecture',
                quip: 'Brulalist Architecture on foreign planets',
                description: 'Default Event',
                organizer: organizer._id,
                happenings: [happening],
                tags: [tags[0]._id],
                images: ['https://cdn.midjourney.com/8c2b3778-6c5a-4355-bca5-610004790827/0_0.png', 'https://cdn.midjourney.com/6467560c-f0b2-424f-b522-79a881c2f9fc/0_0.png', 'https://cdn.midjourney.com/6084addc-0f57-4c7b-8e4e-f13090f14638/0_0.png'],
                category: categories[0]._id,
                price: 30,
                available: 75,
            }).then(() => {
                console.log('Event created');
                CategoryModel.updateOne({_id: categories[0]._id}, {$inc: {amount: 1}}).then(() => {
                    console.log('Category updated');
                }).catch((error) => {
                    console.error('Error updating category:', error);
                });
            }).catch((error) => {
                console.error('Error creating event:', error);
            });
            await EventModel.create({
                _id: uuidv4(),
                name: 'Two Men Standing',
                quip: 'Abstract Urban Art',
                description: 'Default Event',
                organizer: organizer._id,
                happenings: [happening],
                tags: [tags[0]._id],
                category: categories[1]._id,
                images: ['https://cdn.midjourney.com/6467560c-f0b2-424f-b522-79a881c2f9fc/0_0.png', 'https://cdn.midjourney.com/6467560c-f0b2-424f-b522-79a881c2f9fc/0_0.png', 'https://cdn.midjourney.com/6084addc-0f57-4c7b-8e4e-f13090f14638/0_0.png'],
                price: 30,
                available: 75,
            }).then(() => {
                console.log('Event created');
                CategoryModel.updateOne({_id: categories[1]._id}, {$inc: {amount: 1}}).then(() => {
                    console.log('Category updated');
                }).catch((error) => {
                    console.error('Error updating category:', error);
                });
            }).catch((error) => {
                console.error('Error creating event:', error);
            });
            await EventModel.create({
                _id: uuidv4(),
                name: 'Depesh Mode',
                quip: 'Abstract Urban Art',
                description: 'Default Event',
                organizer: organizer._id,
                happenings: [happening],
                tags: [tags[0]._id],
                category: categories[2]._id,
                images: ['https://cdn.midjourney.com/b8d00753-2dcc-4ffa-a87c-3dba2ff6e2b4/0_3.png', 'https://cdn.midjourney.com/6467560c-f0b2-424f-b522-79a881c2f9fc/0_0.png', 'https://cdn.midjourney.com/6084addc-0f57-4c7b-8e4e-f13090f14638/0_0.png'],
                price: 30,
                available: 75,
            }).then(() => {
                console.log('Event created');
                CategoryModel.updateOne({_id: categories[2]._id}, {$inc: {amount: 1}}).then(() => {
                    console.log('Category updated');
                }).catch((error) => {
                    console.error('Error updating category:', error);
                });
            }).catch((error) => {
                console.error('Error creating event:', error);
            });
        }
    }
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
                private_key: `-----BEGIN PRIVATE KEY-----\n${tst.private_key}\n-----END PRIVATE KEY-----\n`,
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


export const extractUserIdFromToken = (token: string, callback: (err: Error | null, userId: string | null) => void) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, data) => {
        const payload = data as IJWTPayload;
        if (err) {
            callback(err, null);
        } else {
            callback(null, payload.user.id);
        }
    });
}


export interface IJWTPayload {
    user: {
        id: string;
    }
}