/**
 * MMS
 * Merchandise Management System -  API first approach
 *
 * OpenAPI spec version: 0.2.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { TaxItem } from './taxItem';

/**
 * a tax group item for a product price;
 */
export interface TaxGroupItem { 
    /**
     * tax id
     */
    groupId?: number;
    item?: TaxItem;
}