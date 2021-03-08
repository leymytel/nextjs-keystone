import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

export default async function addToCart(
    root: any,
    { productId }: { productId: string },
    context: KeystoneContext
): Promise<CartItemCreateInput> {
    console.log('adding to cart');
    // Query the currect user see if they are signed in
    const sesh = context.session as Session;
    if (!sesh.itemId) {
        throw new Error('You must be logged in to do this!');
    }

    // Query the currect users cart
    const allCartItems = await context.lists.CartItem.findMany({
        where: { user: { id: sesh.itemId }, product: { id: productId } },
        resolveFields: 'id,quantity',
    });
    const [existingCartItem] = allCartItems;
    if (existingCartItem) {
        console.log(
            `Thera are already ${existingCartItem.quantity}, increment by 1!`
        );

        // See if the current item is in their cart, if it is, increment by 1
        return await context.lists.CartItem.updateOne({
            id: existingCartItem.id,
            data: { quantity: existingCartItem.quantity + 1 },
        });
    }

    // If it isn't, create a new cart item!
    return await context.lists.CartItem.createOne({
        data: {
            product: { connect: { id: productId } },
            user: { connect: { id: sesh.itemId } },
        },
    });
}
